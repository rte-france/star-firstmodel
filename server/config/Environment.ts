/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


export class Environment {
  public static baseUrlTSO: string =
    process.env.BASE_URL_TSO || `http://127.0.0.1:5000`;
  public static baseUrlDSO: string =
    process.env.BASE_URL_DSO || `http://127.0.0.1:5001`;
  public static baseUrlBSP: string =
    process.env.BASE_URL_BSP || `http://127.0.0.1:5002`;
  public static baseUrlPRODUCER: string =
    process.env.BASE_URL_PRODUCER || `http://127.0.0.1:5003`;
}
