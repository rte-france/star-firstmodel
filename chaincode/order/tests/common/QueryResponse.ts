/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


export interface QueryResponse<T> {
  message: string;
  status: number;
  payload: T;
}
