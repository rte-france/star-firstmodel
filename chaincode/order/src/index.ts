/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Shim} from 'fabric-shim';
import {Chaincode} from './Chaincode';

Shim.start(new Chaincode());
