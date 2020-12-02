/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeStub, Iterators} from 'fabric-shim';
import {AssetType} from '../enums/AssetType';
import {Log} from '../logger/Log';

export class State {
  public constructor(private stub: ChaincodeStub) {}

  public async put<Type>(id: string, object: Type): Promise<void> {
    try {
      await this.stub.putState(id, Buffer.from(JSON.stringify(object)));
    } catch (error) {
      Log.chaincode.error(error);

      throw new Error(error);
    }
  }

  public async update<Type>(id: string, object: Type): Promise<void> {
    if (!(await new State(this.stub).isAssetRegistered(id))) {
      throw new Error(`${typeof object} with ${id} doesn't exist.`);
    }

    try {
      await this.stub.putState(id, Buffer.from(JSON.stringify(object)));
    } catch (error) {
      Log.chaincode.error(error);
      throw new Error(error);
    }
  }

  public async bulkPut<Type>(
    idList: string[],
    objectList: Type[]
  ): Promise<void> {
    try {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < idList.length; i++) {
        await this.stub.putState(
          idList[i],
          Buffer.from(JSON.stringify(objectList[i]))
        );
      }
    } catch (error) {
      Log.chaincode.error(error);
      throw new Error(error);
    }
  }

  public async bulkUpdate<Type>(
    idList: string[],
    objectList: Type[]
  ): Promise<void> {
    try {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < idList.length; i++) {
        await this.stub.putState(
          idList[i],
          Buffer.from(JSON.stringify(objectList[i]))
        );
      }
    } catch (error) {
      Log.chaincode.error(error);
      throw new Error(error);
    }
  }

  public async get<Type>(id: string): Promise<Type> {
    const resultAsBytes: Buffer = await this.stub.getState(id);

    if (!resultAsBytes || !resultAsBytes.toString()) {
      throw new Error(`${id} does not exist.`);
    }

    return JSON.parse(resultAsBytes.toString());
  }

  public async getAll<Type>(assetType: AssetType): Promise<Type[]> {
    const iterator: Iterators.StateQueryIterator = await this.stub.getQueryResult(
      JSON.stringify({
        selector: {
          assetType: assetType
        }
      })
    );

    let result: Iterators.NextResult;
    const results: Type[] = [];

    do {
      result = await iterator.next();

      if (result.value) {
        results.push(JSON.parse(result.value.value.toString('utf8')));
      }
    } while (result.value && !result.done);

    return results;
  }

  public async getByQuery<Type>(
    assetType: AssetType,
    query: any
  ): Promise<Type[]> {
    query.assetType = assetType;

    const iterator: Iterators.StateQueryIterator = await this.stub.getQueryResult(
      JSON.stringify({
        selector: query
      })
    );

    let result: Iterators.NextResult;
    const results: Type[] = [];

    do {
      result = await iterator.next();

      if (result.value) {
        results.push(JSON.parse(result.value.value.toString('utf8')));
      }
    } while (result.value && !result.done);

    return results;
  }

  public async isAssetRegistered(assetId: string): Promise<boolean> {
    const objectAsBytes: Buffer = await this.stub.getState(assetId);

    return objectAsBytes && objectAsBytes.length > 0;
  }
}
