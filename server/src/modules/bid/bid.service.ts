/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {HttpException, Injectable} from '@nestjs/common';
import {BidDto} from './dto/BidDto';
import {FabricConnectorService} from '../fabric-connector/fabric-connector.service';
import {Log} from '../../common/utils/logging/Log';
import {IBidService} from './bid.service.interface';
import {BidChaincodeMethod} from './enum/BidChaincodeMethod';
import {Bid} from '../../models/Bid';
import {ChannelName} from '../../common/enum/ChannelName';
import {TransactionResponse} from '../fabric-connector/models/TransactionResponse';

@Injectable()
export class BidService implements IBidService {
  public constructor(public fabricClient: FabricConnectorService) {}

  public async createBid(bid: BidDto): Promise<Bid> {
    try {
      Log.server.info(
        `[${BidService.name}] calling chaincode method [${BidChaincodeMethod.CreateBid}]`
      );
      const response: TransactionResponse = await this.fabricClient.invoke(
        BidChaincodeMethod.CreateBid,
        [bid],
        ChannelName.StarNetwork
      );

      return response.payload;
    } catch (error) {
      Log.server.error(
        `[${BidService.name}].${BidChaincodeMethod.CreateBid} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async updateBid(bid: BidDto): Promise<Bid> {
    try {
      Log.server.info(`[${BidService.name}].${BidChaincodeMethod.UpdateBid}`);

      const response: TransactionResponse = await this.fabricClient.invoke(
        BidChaincodeMethod.UpdateBid,
        [bid],
        ChannelName.StarNetwork
      );

      return response.payload;
    } catch (error) {
      Log.server.error(
        `[${BidService.name}].${BidChaincodeMethod.UpdateBid} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async createBidsFromCSV(bids: BidDto[]): Promise<string[] | object> {
    try {
      const bidIDs: string[] = [];

      for (const bid of bids) {
        const createdBid: Bid = await this.createBid(Bid.postBidFromJSON(bid));

        bidIDs.push(createdBid.bidId);
      }

      return bidIDs;
    } catch (error) {
      Log.server.error(
        `[${BidService.name}].${BidChaincodeMethod.CreateBid} while registering bids from CSV failed with: [${error.message}]`
      );

      return {
        errorMessage: error.message
      };
    }
  }

  public async getAllBids(): Promise<Bid[]> {
    try {
      Log.server.info(
        `[${BidService.name}] calling chaincode method [${BidChaincodeMethod.GetAllBids}]`
      );

      return await this.fabricClient.query(
        BidChaincodeMethod.GetAllBids,
        [],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${BidService.name}].${BidChaincodeMethod.GetAllBids} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async getBidById(id: string): Promise<Bid> {
    try {
      Log.server.info(
        `[${BidService.name}] calling chaincode method [${BidChaincodeMethod.GetBidById}]`
      );

      return await this.fabricClient.query(
        BidChaincodeMethod.GetBidById,
        [id],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${BidService.name}].${BidChaincodeMethod.GetBidById} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async queryBid(bidQuery: BidDto): Promise<Bid> {
    try {
      Log.server.info(
        `[${BidService.name}] calling chaincode method [${BidChaincodeMethod.QueryBid}]`
      );

      return await this.fabricClient.query(
        BidChaincodeMethod.QueryBid,
        [JSON.stringify(bidQuery)],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${BidService.name}].${BidChaincodeMethod.QueryBid} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }
}
