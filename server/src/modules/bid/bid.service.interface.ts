/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {BidDto} from './dto/BidDto';
import {Bid} from '../../models/Bid';

export interface IBidService {
  createBid(bid: BidDto): Promise<Bid>;

  createBidsFromCSV(bids: BidDto[]): Promise<string[] | object>;

  getBidById(id: string): Promise<Bid>;

  getAllBids(): Promise<Bid[]>;

  queryBid(bid: BidDto): Promise<Bid>;

  updateBid(bid: BidDto): Promise<Bid>;
}
