/*
 * Copyright (C) 2011-2020 Intel Corporation. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *   * Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *   * Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in
 *     the documentation and/or other materials provided with the
 *     distribution.
 *   * Neither the name of Intel Corporation nor the names of its
 *     contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
import PccsError from '../utils/PccsError.js';
import PccsStatus from '../constants/pccs_status_code.js';
import Config from 'config';
import Constants from '../constants/index.js';
import * as pckcrlDao from '../dao/pckcrlDao.js';
import * as pcsCertificatesDao from '../dao/pcsCertificatesDao.js';
import * as pcsClient from '../pcs_client/pcs_client.js';
import { sequelize } from '../dao/models/index.js';

export async function getPckCrlFromPCS(ca) {
  const pck_server_res = await pcsClient.getPckCrl(ca);

  if (pck_server_res.statusCode != Constants.HTTP_SUCCESS) {
    throw new PccsError(PccsStatus.PCCS_STATUS_NO_CACHE_DATA);
  }

  let result = {};
  result[Constants.SGX_PCK_CRL_ISSUER_CHAIN] =
    pck_server_res.headers[Constants.SGX_PCK_CRL_ISSUER_CHAIN];
  let crl_hex = Buffer.from(pck_server_res.rawBody, 'utf8').toString('hex');
  result['pckcrl'] = crl_hex;

  await sequelize.transaction(async (t) => {
    // update or insert PCK CRL
    await pckcrlDao.upsertPckCrl(ca, crl_hex);
    // update or insert certificate chain
    await pcsCertificatesDao.upsertPckCrlCertchain(
      ca,
      pck_server_res.headers[Constants.SGX_PCK_CRL_ISSUER_CHAIN]
    );
  });
  return result;
}

export async function getPckCrl(ca) {
  // query pck crl from local database first
  const pckcrl = await pckcrlDao.getPckCrl(ca);
  let result = {};
  if (pckcrl == null) {
    if (
      Config.get(Constants.CONFIG_OPTION_CACHE_FILL_MODE) ==
      Constants.CACHE_FILL_MODE_LAZY
    ) {
      result = await this.getPckCrlFromPCS(ca);
    } else {
      throw new PccsError(PccsStatus.PCCS_STATUS_NO_CACHE_DATA);
    }
  } else {
    result[Constants.SGX_PCK_CRL_ISSUER_CHAIN] =
      pckcrl.intmd_cert + pckcrl.root_cert;
    result['pckcrl'] = pckcrl.pck_crl;
  }

  return result;
}
