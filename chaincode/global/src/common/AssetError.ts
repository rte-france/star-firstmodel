/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


export class AssetError extends Error {
  public constructor(
    private readonly assetId: string,
    private readonly transaction: string,
    private readonly causeDescription: string
  ) {
    super(
      `${transaction} resulted in an Error for ${assetId}. Reason: ${causeDescription}`
    );
  }
}
