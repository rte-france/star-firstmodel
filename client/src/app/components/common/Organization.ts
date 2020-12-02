/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


export class Organization {
  public static isTSOType(organization: string) {
    return organization === 'tso';
  }

  public static isBSPType(organization: string) {
    return organization === 'bsp';
  }

  public static isProducerType(organization: string) {
    return organization === 'producer';
  }
}
