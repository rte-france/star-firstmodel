/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {createLogger, format, Logger, transports} from 'winston';

export class LoggerFactory {
  private static getLogger = (label: string) => {
    return createLogger({
      transports: [
        new transports.Console({
          level: 'debug'
        })
      ],
      format: format.combine(
        format.colorize(),
        format.splat(),
        format.simple(),
        format.label({label: label})
      ),
      exitOnError: false
    });
  };

  public static fabric: Logger = LoggerFactory.getLogger('FABRIC');
  public static grpc: Logger = LoggerFactory.getLogger('GRPC');
  public static config: Logger = LoggerFactory.getLogger('CONFIG');
  public static server: Logger = LoggerFactory.getLogger('SERVER');
}
