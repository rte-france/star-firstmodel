/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {BroadcastResponse} from 'fabric-client';

export class TransactionResponse implements BroadcastResponse {
  public constructor(
    public status: string,
    public info: string,
    public transactionId: string,
    public payload: any
  ) {}
}

