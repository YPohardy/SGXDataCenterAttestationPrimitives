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
 /**
 * File: RegistrationService.h
 *
 * Description: High level class definition to implement the registration 
 * agent service/daemon.
 */
#ifndef __REGISTRATION_SERVICE_H
#define __REGISTRATION_SERVICE_H

#include "AgentConfiguration.h"
#include "MPNetwork.h"
#include "MPUefi.h"

#define REGISTRATION_RETRY_TIMES 5
 
#pragma pack(push, 1)
class RegistrationService {
    public:
        RegistrationService(const MPConfigurations &conf);
        void registerPlatformIfNeeded();
        bool isMultiPackageCapable();
        ~RegistrationService();
    private:
        MPConfigurations m_conf;
        MPUefi *m_uefi;
        MPNetwork *m_network;
        LogLevel m_gLogLevel;
        RegistrationService& operator=(const RegistrationService&) {return *this;}
        RegistrationService(const RegistrationService& src) {(void) src; }
};
#pragma pack(pop) 
#endif  // #ifndef __REGISTRATION_SERVICE_H

