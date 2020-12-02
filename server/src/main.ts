/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {NestFactory} from '@nestjs/core';
import {INestApplication, ValidationPipe} from '@nestjs/common';
import {AppModule} from './app.module';
import {configuration} from './config/Configuration';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {Log} from './common/utils/logging/Log';

const bootstrap = async (): Promise<void> => {
  const app: INestApplication = await NestFactory.create(AppModule);
  const port: number = configuration.port;

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: '*'
  });

  const documentBuilder: DocumentBuilder = new DocumentBuilder()
    .setTitle('star-server')
    .setVersion('0.1')
    .addBearerAuth();

  SwaggerModule.setup(
    '/swagger',
    app,
    SwaggerModule.createDocument(app, documentBuilder.build())
  );

  await app.listen(port, () => {
    Log.server.info(`Started server on port: ${port}`);
  });
};

bootstrap().catch((error: Error) => {
  Log.server.error('Error starting server: ', error);
});
