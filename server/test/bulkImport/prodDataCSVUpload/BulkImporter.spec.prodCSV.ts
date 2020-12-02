/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {expect} from 'chai';
import axios from 'axios';
import {EDA} from '../../../src/models/EDA';
import {Bid} from '../../../src/models/Bid';
import {Site} from '../../../src/models/Site';
import {HV} from '../../../src/models/HV';
import {MV} from '../../../src/models/MV';
import {EDP} from '../../../src/models/EDP';
import {PowerPlanEnergySchedule} from '../../../src/models/PowerPlanEnergySchedule';
import {OrderActivationDocument} from '../../../src/models/OrderActivationDocument';

// LOCAL
const BASE_URL_TSO: string =
  process.env.BASE_URL_TSO || 'http://localhost:5000';
const BASE_URL_DSO: string =
  process.env.BASE_URL_BSP || 'http://localhost:5001';
const BASE_URL_BSP: string =
  process.env.BASE_URL_BSP || 'http://localhost:5002';

// TEST
// const BASE_URL_TSO: string = 'http://localhost:5000';
// const BASE_URL_DSO: string = 'http://localhost:5001';
// const BASE_URL_BSP: string = 'http://localhost:5002';

// PROD
// const BASE_URL_TSO: string = 'http://localhost:5000';
// const BASE_URL_DSO: string = 'http://localhost:5001';
// const BASE_URL_BSP: string = 'http://localhost:5002';

let tokenTSO1: string;
let tokenDSO2: string;
let tokenDSO3: string;
let tokenBSP1: string;
let tokenBSP2: string;
let tokenBSP3: string;

const edaData: EDA[] = require('./asset/eda.json');
const edaListInserted: EDA[] = [];

const bidData20191231: Bid[] = require('./asset/20191231/bid.json');
const bidData20200101: Bid[] = require('./asset/20200101/bid.json');
const bidData20200117: Bid[] = require('./asset/20200117/bid.json');
const bidData20200204: Bid[] = require('./asset/20200204/bid.json');
const bidListInserted: any[] = [];

const siteData: Site[] = require('./asset/sites.json');
const siteListInserted: any[] = [];

const mvData20191231: MV[] = require('./asset/20191231/mv.json');
const mvData20200101: MV[] = require('./asset/20200101/mv.json');
const mvData20200117: MV[] = require('./asset/20200117/mv.json');
const mvData20200204: MV[] = require('./asset/20200204/mv.json');
const mvListInserted: any[] = [];

const hvData20200117: HV[] = require('./asset/20200117/hv.json');
const hvData20200204: HV[] = require('./asset/20200204/hv.json');
const hvListInserted: HV[] = [];

const edpData: EDP[] = require('./asset/edp.json');
const edpListInserted: EDP[] = [];

const powerPlanEnergyScheduleData20191231: PowerPlanEnergySchedule[] = require('./asset/20191231/powerPlanEnergySchedule.json');
const powerPlanEnergyScheduleData20200101: PowerPlanEnergySchedule[] = require('./asset/20200101/powerPlanEnergySchedule.json');
const powerPlanEnergyScheduleData20200117: PowerPlanEnergySchedule[] = require('./asset/20200117/powerPlanEnergySchedule.json');
const powerPlanEnergyScheduleData20200204: PowerPlanEnergySchedule[] = require('./asset/20200204/powerPlanEnergySchedule.json');
const powerPlanEnergyScheduleListInserted: any[] = [];

const orderActivationDocumentCreateData20201231: OrderActivationDocument[] = require('./asset/20191231/orderActivationDocumentCreate.json');
const orderActivationDocumentCreateData20200117: OrderActivationDocument[] = require('./asset/20200117/orderActivationDocumentCreate.json');
const orderActivationDocumentCreateData20200204: OrderActivationDocument[] = require('./asset/20200204/orderActivationDocumentCreate.json');
const orderActivationDocumentInserted20200101: any[] = [];
const orderActivationDocumentInserted20200117: any[] = [];
const orderActivationDocumentInserted20200204: any[] = [];

const orderActivationDocumentEndData20200101: OrderActivationDocument[] = require('./asset/20200101/orderActivationDocumentEnd.json');
const orderActivationDocumentEndData20200117: OrderActivationDocument[] = require('./asset/20200117/orderActivationDocumentEnd.json');
const orderActivationDocumentEndData20200204: any[] = require('./asset/20200204/orderActivationDocumentEnd.json');

describe('Bulk Import', function(): void {
  jest.setTimeout(1201000000);

  beforeAll(async () => {
    const response = await axios.post(
      `${BASE_URL_TSO}/api/auth/login`,
      {userEmail: 'user.star@tso1.com', password: 'passw0rd'},
      {headers: {'Content-Type': 'application/json'}}
    );
    tokenTSO1 = response.data.token;
    const responseBSP1 = await axios.post(
      `${BASE_URL_BSP}/api/auth/login`,
      {userEmail: 'user.star@bsp1.com', password: 'passw0rd'},
      {headers: {'Content-Type': 'application/json'}}
    );
    tokenBSP1 = responseBSP1.data.token;
    const responseBSP2 = await axios.post(
      `${BASE_URL_BSP}/api/auth/login`,
      {userEmail: 'user.star@bsp2.com', password: 'passw0rd'},
      {headers: {'Content-Type': 'application/json'}}
    );
    tokenBSP2 = responseBSP2.data.token;
    const responseBSP3 = await axios.post(
      `${BASE_URL_BSP}/api/auth/login`,
      {userEmail: 'user.star@bsp3.com', password: 'passw0rd'},
      {headers: {'Content-Type': 'application/json'}}
    );
    tokenBSP3 = responseBSP3.data.token;
    const responseDSO2 = await axios.post(
      `${BASE_URL_DSO}/api/auth/login`,
      {userEmail: 'user.star@dso2.com', password: 'passw0rd'},
      {headers: {'Content-Type': 'application/json'}}
    );
    tokenDSO2 = responseDSO2.data.token;
    const responseDSO3 = await axios.post(
      `${BASE_URL_DSO}/api/auth/login`,
      {userEmail: 'user.star@dso3.com', password: 'passw0rd'},
      {headers: {'Content-Type': 'application/json'}}
    );
    tokenDSO3 = responseDSO3.data.token;
  });

  /**
   * EDA INSERTION
   * INSERTION BY TSO
   */

  it('Insert EDA 1', async () => {
    const response = await axios.post(`${BASE_URL_TSO}/api/eda`, edaData[0], {
      headers: {'x-access-token': tokenTSO1}
    });
    const createdEDA: EDA = response.data;
    expect(response.status).equal(201);
    edaListInserted.push(createdEDA);
    console.info('[=                        ]');
  });

  it('Insert EDA 2', async () => {
    const response = await axios.post(`${BASE_URL_TSO}/api/eda`, edaData[1], {
      headers: {'x-access-token': tokenTSO1}
    });
    const createdEDA: EDA = response.data;
    expect(response.status).equal(201);
    edaListInserted.push(createdEDA);
  });

  it('Insert EDA 3', async () => {
    const response = await axios.post(`${BASE_URL_TSO}/api/eda`, edaData[2], {
      headers: {'x-access-token': tokenTSO1}
    });
    const createdEDA: EDA = response.data;
    expect(response.status).equal(201);
    edaListInserted.push(createdEDA);
    console.info('[==                       ]');
  });

  /**
   * BID INSERTION
   * INSERTION BY BSP
   */
  it('Insert BID 1', async () => {
    const bid: Bid = bidData20191231[0];
    bid.edaRegisteredResourceId = edaListInserted.find(
      (eda: EDA) =>
        eda.edaRegisteredResourceMrid === bid.edaRegisteredResourceMrid
    ).edaRegisteredResourceId;
    const response = await axios.post(`${BASE_URL_BSP}/api/bid`, bid, {
      headers: {'x-access-token': tokenBSP1}
    });
    expect(response.status).equal(201);
    bidListInserted.push({data: response.data, token: tokenBSP1});
  });

  it('Insert BID 2', async () => {
    const bid: Bid = bidData20191231[1];
    bid.edaRegisteredResourceId = edaListInserted.find(
      (eda: EDA) =>
        eda.edaRegisteredResourceMrid === bid.edaRegisteredResourceMrid
    ).edaRegisteredResourceId;
    const response = await axios.post(`${BASE_URL_BSP}/api/bid`, bid, {
      headers: {'x-access-token': tokenBSP2}
    });
    expect(response.status).equal(201);
    bidListInserted.push({data: response.data, token: tokenBSP2});
    console.info('[===                      ]');
  });

  it('Insert BID 3', async () => {
    const bid: Bid = bidData20200101[0];
    bid.edaRegisteredResourceId = edaListInserted.find(
      (eda: EDA) =>
        eda.edaRegisteredResourceMrid === bid.edaRegisteredResourceMrid
    ).edaRegisteredResourceId;
    const response = await axios.post(`${BASE_URL_BSP}/api/bid`, bid, {
      headers: {'x-access-token': tokenBSP1}
    });
    expect(response.status).equal(201);
    bidListInserted.push({data: response.data, token: tokenBSP1});
  });

  it('Insert BID 4', async () => {
    const bid: Bid = bidData20200101[1];
    bid.edaRegisteredResourceId = edaListInserted.find(
      (eda: EDA) =>
        eda.edaRegisteredResourceMrid === bid.edaRegisteredResourceMrid
    ).edaRegisteredResourceId;
    const response = await axios.post(`${BASE_URL_BSP}/api/bid`, bid, {
      headers: {'x-access-token': tokenBSP2}
    });
    expect(response.status).equal(201);
    bidListInserted.push({data: response.data, token: tokenBSP2});
  });

  it('Insert BID 5', async () => {
    const bid: Bid = bidData20200117[0];
    console.info(
      'bid edaRegisteredResourceId:',
      edaListInserted.find(
        (eda: EDA) =>
          eda.edaRegisteredResourceMrid === bid.edaRegisteredResourceMrid
      ).edaRegisteredResourceId
    );
  });

  it('Insert BID 6', async () => {
    const bid: Bid = bidData20200117[1];
    bid.edaRegisteredResourceId = edaListInserted.find(
      (eda: EDA) =>
        eda.edaRegisteredResourceMrid === bid.edaRegisteredResourceMrid
    ).edaRegisteredResourceId;
    const response = await axios.post(`${BASE_URL_BSP}/api/bid`, bid, {
      headers: {'x-access-token': tokenBSP2}
    });
    expect(response.status).equal(201);
    bidListInserted.push({data: response.data, token: tokenBSP2});
  });

  it('Insert BID 7', async () => {
    const bid: Bid = bidData20200204[0];
    bid.edaRegisteredResourceId = edaListInserted.find(
      (eda: EDA) =>
        eda.edaRegisteredResourceMrid === bid.edaRegisteredResourceMrid
    ).edaRegisteredResourceId;
    const response = await axios.post(`${BASE_URL_BSP}/api/bid`, bid, {
      headers: {'x-access-token': tokenBSP1}
    });
    expect(response.status).equal(201);
    bidListInserted.push({data: response.data, token: tokenBSP1});
  });

  it('Insert BID 8', async () => {
    const bid: Bid = bidData20200204[1];
    bid.edaRegisteredResourceId = edaListInserted.find(
      (eda: EDA) =>
        eda.edaRegisteredResourceMrid === bid.edaRegisteredResourceMrid
    ).edaRegisteredResourceId;
    const response = await axios.post(`${BASE_URL_BSP}/api/bid`, bid, {
      headers: {'x-access-token': tokenBSP2}
    });
    expect(response.status).equal(201);
    bidListInserted.push({data: response.data, token: tokenBSP2});
  });

  /**
   * Site INSERTION
   * INSERTION BY DSO
   */
  it('Insert SITE 1', async () => {
    const site: Site = siteData[0];
    site.edaRegisteredResourceId = edaListInserted.find(
      (eda: EDA) =>
        eda.edaRegisteredResourceMrid === site.edaRegisteredResourceId
    ).edaRegisteredResourceId;
    const response = await axios.post(`${BASE_URL_DSO}/api/site`, site, {
      headers: {'x-access-token': tokenDSO3}
    });
    expect(response.status).equal(201);
    const createdSite: Site = response.data;
    siteListInserted.push({data: createdSite, token: tokenDSO3});
    console.info('[====                     ]');
  });

  it('Insert SITE 2', async () => {
    const site: Site = siteData[1];
    site.edaRegisteredResourceId = edaListInserted.find(
      (eda: EDA) =>
        eda.edaRegisteredResourceMrid === site.edaRegisteredResourceId
    ).edaRegisteredResourceId;

    const response = await axios.post(`${BASE_URL_DSO}/api/site`, site, {
      headers: {'x-access-token': tokenDSO3}
    });
    expect(response.status).equal(201);

    const createdSite: Site = response.data;
    siteListInserted.push({data: createdSite, token: tokenDSO3});
  });

  it('Insert SITE 3', async () => {
    const site: Site = siteData[2];
    site.edaRegisteredResourceId = edaListInserted.find(
      (eda: EDA) =>
        eda.edaRegisteredResourceMrid === site.edaRegisteredResourceId
    ).edaRegisteredResourceId;
    const response = await axios.post(`${BASE_URL_DSO}/api/site`, site, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    const createdSite: Site = response.data;
    siteListInserted.push({data: createdSite, token: tokenDSO2});
    console.info('[=====                    ]');
  });

  it('Insert SITE 4', async () => {
    const site: Site = siteData[3];
    site.edaRegisteredResourceId = edaListInserted.find(
      (eda: EDA) =>
        eda.edaRegisteredResourceMrid === site.edaRegisteredResourceId
    ).edaRegisteredResourceId;
    const response = await axios.post(`${BASE_URL_TSO}/api/site`, site, {
      headers: {'x-access-token': tokenTSO1}
    });
    expect(response.status).equal(201);
    const createdSite: Site = response.data;
    siteListInserted.push({data: createdSite, token: tokenTSO1});
  });

  it('Insert SITE 5', async () => {
    const site: Site = siteData[4];
    site.edaRegisteredResourceId = edaListInserted.find(
      (eda: EDA) =>
        eda.edaRegisteredResourceMrid === site.edaRegisteredResourceId
    ).edaRegisteredResourceId;
    const response = await axios.post(`${BASE_URL_DSO}/api/site`, site, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    const createdSite: Site = response.data;
    siteListInserted.push({data: createdSite, token: tokenDSO2});
    console.info('[======                   ]');
  });

  it('Insert SITE 6', async () => {
    const site: Site = siteData[5];
    site.edaRegisteredResourceId = edaListInserted.find(
      (eda: EDA) =>
        eda.edaRegisteredResourceMrid === site.edaRegisteredResourceId
    ).edaRegisteredResourceId;
    const response = await axios.post(`${BASE_URL_DSO}/api/site`, site, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    const createdSite: Site = response.data;
    siteListInserted.push({data: createdSite, token: tokenDSO2});
  });

  it('Insert SITE 7', async () => {
    const site: Site = siteData[6];
    site.edaRegisteredResourceId = edaListInserted.find(
      (eda: EDA) =>
        eda.edaRegisteredResourceMrid === site.edaRegisteredResourceId
    ).edaRegisteredResourceId;
    const response = await axios.post(`${BASE_URL_DSO}/api/site`, site, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    const createdSite: Site = response.data;
    siteListInserted.push({data: createdSite, token: tokenDSO2});
    console.info('[=======                  ]');
  });

  it('Insert SITE 8', async () => {
    const site: Site = siteData[7];
    site.edaRegisteredResourceId = edaListInserted.find(
      (eda: EDA) =>
        eda.edaRegisteredResourceMrid === site.edaRegisteredResourceId
    ).edaRegisteredResourceId;
    const response = await axios.post(`${BASE_URL_DSO}/api/site`, site, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    const createdSite: Site = response.data;
    siteListInserted.push({data: createdSite, token: tokenDSO2});
  });

  /**
   * HV INSERTION
   * INSERTION BY TSO
   */
  it('Insert HV 1 20200117', async () => {
    const hv: HV = hvData20200117[0];
    hv.siteId = siteListInserted.find(
      (site) => site.data.objectAggregationMeteringPoint === hv.ppeSiteCode
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_TSO}/api/comptage/HV`, hv, {
      headers: {'x-access-token': tokenTSO1}
    });
    expect(response.status).equal(201);
    hvListInserted.push(response.data);
    console.info('[========                 ]');
  });

  it('Insert HV 1 20200204', async () => {
    const hv: HV = hvData20200204[0];
    hv.siteId = siteListInserted.find(
      (site) => site.data.objectAggregationMeteringPoint === hv.ppeSiteCode
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_TSO}/api/comptage/HV`, hv, {
      headers: {'x-access-token': tokenTSO1}
    });
    expect(response.status).equal(201);
    hvListInserted.push(response.data);
    console.info('[========                 ]');
  });

  /**
   * MV INSERTION
   * INSERTION BY DSO
   */
  it('Insert MV 1 20191231', async () => {
    const mv: MV = mvData20191231[0];
    mv.siteId = siteListInserted.find(
      (site) =>
        site.data.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO3}
    });
    expect(response.status).equal(201);
    mvListInserted.push({data: response.data, token: tokenDSO3});
  });

  it('Insert MV 2 20191231', async () => {
    const mv: MV = mvData20191231[1];
    mv.siteId = siteListInserted.find(
      (site) =>
        site.data.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO3}
    });
    expect(response.status).equal(201);
    mvListInserted.push({data: response.data, token: tokenDSO3});
    console.info('[=========                ]');
  });

  it('Insert MV 1 20200101', async () => {
    const mv: MV = mvData20200101[0];
    mv.siteId = siteListInserted.find(
      (site) =>
        site.data.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO3}
    });
    expect(response.status).equal(201);
    mvListInserted.push({data: response.data, token: tokenDSO3});
  });

  it('Insert MV 2 20200101', async () => {
    const mv: MV = mvData20200101[1];
    mv.siteId = siteListInserted.find(
      (site) =>
        site.data.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO3}
    });
    expect(response.status).equal(201);
    mvListInserted.push({data: response.data, token: tokenDSO3});
    console.info('[=========                ]');
  });

  it('Insert MV 1 20200117', async () => {
    const mv: MV = mvData20200117[0];
    console.info(
      'mv siteId:',
      siteListInserted.find(
        (site) =>
          site.data.objectAggregationMeteringPoint ===
          mv.objectAggregationMeteringPoint
      ).data.siteId
    );
  });

  it('Insert MV 2 20200117', async () => {
    const mv: MV = mvData20200117[1];
    mv.siteId = siteListInserted.find(
      (site) =>
        site.data.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO3}
    });
    expect(response.status).equal(201);
    mvListInserted.push({data: response.data, token: tokenDSO3});
    console.info('[=========                ]');
  });

  it('Insert MV 3 20200117', async () => {
    const mv: MV = mvData20200117[2];
    mv.siteId = siteListInserted.find(
      (site) =>
        site.data.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    mvListInserted.push({data: response.data, token: tokenDSO2});
  });

  it('Insert MV 4 20200117', async () => {
    const mv: MV = mvData20200117[3];
    mv.siteId = siteListInserted.find(
      (site) =>
        site.data.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    mvListInserted.push({data: response.data, token: tokenDSO2});
    console.info('[==========               ]');
  });

  it('Insert MV 5 20200117', async () => {
    const mv: MV = mvData20200117[4];
    mv.siteId = siteListInserted.find(
      (site) =>
        site.data.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    mvListInserted.push({data: response.data, token: tokenDSO2});
  });

  it('Insert MV 6 20200117', async () => {
    const mv: MV = mvData20200117[5];
    mv.siteId = siteListInserted.find(
      (site) =>
        site.data.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    mvListInserted.push({data: response.data, token: tokenDSO2});
    console.info('[===========              ]');
  });

  it('Insert MV 7 20200117', async () => {
    const mv: MV = mvData20200117[6];
    mv.siteId = siteListInserted.find(
      (site) =>
        site.data.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    mvListInserted.push({data: response.data, token: tokenDSO2});
  });

  it('Insert MV 1 20200204', async () => {
    const mv: MV = mvData20200204[0];
    mv.siteId = siteListInserted.find(
      (site) =>
        site.data.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO3}
    });
    expect(response.status).equal(201);
    mvListInserted.push({data: response.data, token: tokenDSO3});
  });

  it('Insert MV 2 20200204', async () => {
    const mv: MV = mvData20200204[1];
    mv.siteId = siteListInserted.find(
      (site) =>
        site.data.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO3}
    });
    expect(response.status).equal(201);
    mvListInserted.push({data: response.data, token: tokenDSO3});
    console.info('[=========                ]');
  });

  it('Insert MV 3 20200204', async () => {
    const mv: MV = mvData20200204[2];
    mv.siteId = siteListInserted.find(
      (site) =>
        site.data.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    mvListInserted.push({data: response.data, token: tokenDSO2});
  });

  it('Insert MV 4 20200204', async () => {
    const mv: MV = mvData20200204[3];
    mv.siteId = siteListInserted.find(
      (site) =>
        site.data.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    mvListInserted.push({data: response.data, token: tokenDSO2});
    console.info('[==========               ]');
  });

  it('Insert MV 5 20200204', async () => {
    const mv: MV = mvData20200204[4];
    mv.siteId = siteListInserted.find(
      (site) =>
        site.data.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    mvListInserted.push({data: response.data, token: tokenDSO2});
  });

  it('Insert MV 6 20200204', async () => {
    const mv: MV = mvData20200204[5];
    mv.siteId = siteListInserted.find(
      (site) =>
        site.data.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    mvListInserted.push({data: response.data, token: tokenDSO2});
    console.info('[===========              ]');
  });

  it('Insert MV 7 20200204', async () => {
    const mv: MV = mvData20200204[6];
    mv.siteId = siteListInserted.find(
      (site) =>
        site.data.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    mvListInserted.push({data: response.data, token: tokenDSO2});
  });

  /**
   * EDP INSERTION
   * INSERTION BY TSO
   */
  it('Insert EDP 1', async () => {
    const edp: EDP = edpData[0];
    edp.siteId = siteListInserted.find(
      (site) => site.data.objectAggregationMeteringPoint === edp.siteId
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_TSO}/api/edp`, edp, {
      headers: {'x-access-token': tokenTSO1}
    });
    expect(response.status).equal(201);
    const createEDP: EDP = response.data;
    edpListInserted.push(createEDP);
    console.info('[============             ]');
  });

  it('Insert EDP 2', async () => {
    const edp: EDP = edpData[1];
    edp.siteId = siteListInserted.find(
      (site) => site.data.objectAggregationMeteringPoint === edp.siteId
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_TSO}/api/edp`, edp, {
      headers: {'x-access-token': tokenTSO1}
    });
    expect(response.status).equal(201);
    const createEDP: EDP = response.data;
    edpListInserted.push(createEDP);
  });

  it('Insert EDP 3', async () => {
    const edp: EDP = edpData[2];
    edp.siteId = siteListInserted.find(
      (site) => site.data.objectAggregationMeteringPoint === edp.siteId
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_TSO}/api/edp`, edp, {
      headers: {'x-access-token': tokenTSO1}
    });
    expect(response.status).equal(201);
    const createEDP: EDP = response.data;
    edpListInserted.push(createEDP);
    console.info('[=============            ]');
  });

  it('Insert EDP 4', async () => {
    const edp: EDP = edpData[3];
    edp.siteId = siteListInserted.find(
      (site) => site.data.objectAggregationMeteringPoint === edp.siteId
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_TSO}/api/edp`, edp, {
      headers: {'x-access-token': tokenTSO1}
    });
    expect(response.status).equal(201);
    const createEDP: EDP = response.data;
    edpListInserted.push(createEDP);
  });

  it('Insert EDP 5', async () => {
    const edp: EDP = edpData[4];
    edp.siteId = siteListInserted.find(
      (site) => site.data.objectAggregationMeteringPoint === edp.siteId
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_TSO}/api/edp`, edp, {
      headers: {'x-access-token': tokenTSO1}
    });
    expect(response.status).equal(201);
    const createEDP: EDP = response.data;
    edpListInserted.push(createEDP);
    console.info('[==============           ]');
  });

  it('Insert EDP 6', async () => {
    const edp: EDP = edpData[5];
    edp.siteId = siteListInserted.find(
      (site) => site.data.objectAggregationMeteringPoint === edp.siteId
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_TSO}/api/edp`, edp, {
      headers: {'x-access-token': tokenTSO1}
    });
    expect(response.status).equal(201);
    const createEDP: EDP = response.data;
    edpListInserted.push(createEDP);
  });

  it('Insert EDP 7', async () => {
    const edp: EDP = edpData[6];
    edp.siteId = siteListInserted.find(
      (site) => site.data.objectAggregationMeteringPoint === edp.siteId
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_TSO}/api/edp`, edp, {
      headers: {'x-access-token': tokenTSO1}
    });
    expect(response.status).equal(201);
    const createEDP: EDP = response.data;
    edpListInserted.push(createEDP);
    console.info('[===============          ]');
  });

  it('Insert EDP 8', async () => {
    const edp: EDP = edpData[7];
    edp.siteId = siteListInserted.find(
      (site) => site.data.objectAggregationMeteringPoint === edp.siteId
    ).data.siteId;
    const response = await axios.post(`${BASE_URL_TSO}/api/edp`, edp, {
      headers: {'x-access-token': tokenTSO1}
    });
    expect(response.status).equal(201);
    const createEDP: EDP = response.data;
    edpListInserted.push(createEDP);
  });

  /**
   * PowerPlanEnergySchedule INSERTION
   */
  it('Insert PowerPlanEnergySchedule 1 20191231', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData20191231[0];
    powerPlanEnergySchedule.edpRegisteredResourceId = edpListInserted.find(
      (edp: EDP) =>
        edp.edpRegisteredResourceMrid ===
        powerPlanEnergySchedule.edpRegisteredResourceMrid
    ).edpRegisteredResourceId;
    const response = await axios.post(
      `${BASE_URL_BSP}/api/powerPlanEnergySchedule`,
      powerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP1}}
    );
    expect(response.status).equal(201);
    powerPlanEnergyScheduleListInserted.push({
      data: response.data,
      token: tokenBSP1
    });
    console.info('[================         ]');
  });

  it('Insert PowerPlanEnergySchedule 2 20191231', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData20191231[1];
    powerPlanEnergySchedule.edpRegisteredResourceId = edpListInserted.find(
      (edp: EDP) =>
        edp.edpRegisteredResourceMrid ===
        powerPlanEnergySchedule.edpRegisteredResourceMrid
    ).edpRegisteredResourceId;
    const response = await axios.post(
      `${BASE_URL_BSP}/api/powerPlanEnergySchedule`,
      powerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP1}}
    );
    expect(response.status).equal(201);
    powerPlanEnergyScheduleListInserted.push({
      data: response.data,
      token: tokenBSP1
    });
  });

  it('Insert PowerPlanEnergySchedule 1 20200101', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData20200101[0];
    powerPlanEnergySchedule.edpRegisteredResourceId = edpListInserted.find(
      (edp: EDP) =>
        edp.edpRegisteredResourceMrid ===
        powerPlanEnergySchedule.edpRegisteredResourceMrid
    ).edpRegisteredResourceId;
    const response = await axios.post(
      `${BASE_URL_BSP}/api/powerPlanEnergySchedule`,
      powerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP1}}
    );
    expect(response.status).equal(201);
    powerPlanEnergyScheduleListInserted.push({
      data: response.data,
      token: tokenBSP1
    });
    console.info('[================         ]');
  });

  it('Insert PowerPlanEnergySchedule 2 20200101', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData20200101[1];
    powerPlanEnergySchedule.edpRegisteredResourceId = edpListInserted.find(
      (edp: EDP) =>
        edp.edpRegisteredResourceMrid ===
        powerPlanEnergySchedule.edpRegisteredResourceMrid
    ).edpRegisteredResourceId;
    const response = await axios.post(
      `${BASE_URL_BSP}/api/powerPlanEnergySchedule`,
      powerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP1}}
    );
    expect(response.status).equal(201);
    powerPlanEnergyScheduleListInserted.push({
      data: response.data,
      token: tokenBSP1
    });
  });

  it('Insert PowerPlanEnergySchedule 1 20200117', async () => {
    console.info('powerPlanEnergySchedule0 edpRegisteredResourceId');
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData20200117[0];
    console.info(
      'powerPlanEnergySchedule0 edpRegisteredResourceId:',
      edpListInserted.find(
        (edp: EDP) =>
          edp.edpRegisteredResourceMrid ===
          powerPlanEnergySchedule.edpRegisteredResourceMrid
      ).edpRegisteredResourceId
    );
    console.info('[================         ]');
  });

  it('Insert PowerPlanEnergySchedule 2 20200117', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData20200117[1];
    powerPlanEnergySchedule.edpRegisteredResourceId = edpListInserted.find(
      (edp: EDP) =>
        edp.edpRegisteredResourceMrid ===
        powerPlanEnergySchedule.edpRegisteredResourceMrid
    ).edpRegisteredResourceId;
    const response = await axios.post(
      `${BASE_URL_BSP}/api/powerPlanEnergySchedule`,
      powerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP1}}
    );
    expect(response.status).equal(201);
    powerPlanEnergyScheduleListInserted.push({
      data: response.data,
      token: tokenBSP1
    });
  });

  it('Insert PowerPlanEnergySchedule 3 20200117', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData20200117[2];
    powerPlanEnergySchedule.edpRegisteredResourceId = edpListInserted.find(
      (edp: EDP) =>
        edp.edpRegisteredResourceMrid ===
        powerPlanEnergySchedule.edpRegisteredResourceMrid
    ).edpRegisteredResourceId;
    const response = await axios.post(
      `${BASE_URL_BSP}/api/powerPlanEnergySchedule`,
      powerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP1}}
    );
    expect(response.status).equal(201);
    powerPlanEnergyScheduleListInserted.push({
      data: response.data,
      token: tokenBSP1
    });
    console.info('[=================        ]');
  });

  it('Insert PowerPlanEnergySchedule 4 20200117', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData20200117[3];
    powerPlanEnergySchedule.edpRegisteredResourceId = edpListInserted.find(
      (edp: EDP) =>
        edp.edpRegisteredResourceMrid ===
        powerPlanEnergySchedule.edpRegisteredResourceMrid
    ).edpRegisteredResourceId;
    const response = await axios.post(
      `${BASE_URL_BSP}/api/powerPlanEnergySchedule`,
      powerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP1}}
    );
    expect(response.status).equal(201);
    powerPlanEnergyScheduleListInserted.push({
      data: response.data,
      token: tokenBSP1
    });
  });

  it('Insert PowerPlanEnergySchedule 5 20200117', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData20200117[4];
    powerPlanEnergySchedule.edpRegisteredResourceId = edpListInserted.find(
      (edp: EDP) =>
        edp.edpRegisteredResourceMrid ===
        powerPlanEnergySchedule.edpRegisteredResourceMrid
    ).edpRegisteredResourceId;
    const response = await axios.post(
      `${BASE_URL_BSP}/api/powerPlanEnergySchedule`,
      powerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP2}}
    );
    expect(response.status).equal(201);
    powerPlanEnergyScheduleListInserted.push({
      data: response.data,
      token: tokenBSP2
    });
    console.info('[==================       ]');
  });

  it('Insert PowerPlanEnergySchedule 6 20200117', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData20200117[5];
    powerPlanEnergySchedule.edpRegisteredResourceId = edpListInserted.find(
      (edp: EDP) =>
        edp.edpRegisteredResourceMrid ===
        powerPlanEnergySchedule.edpRegisteredResourceMrid
    ).edpRegisteredResourceId;
    const response = await axios.post(
      `${BASE_URL_BSP}/api/powerPlanEnergySchedule`,
      powerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP3}}
    );
    expect(response.status).equal(201);
    powerPlanEnergyScheduleListInserted.push({
      data: response.data,
      token: tokenBSP3
    });
  });

  it('Insert PowerPlanEnergySchedule 7 20200117', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData20200117[6];
    powerPlanEnergySchedule.edpRegisteredResourceId = edpListInserted.find(
      (edp: EDP) =>
        edp.edpRegisteredResourceMrid ===
        powerPlanEnergySchedule.edpRegisteredResourceMrid
    ).edpRegisteredResourceId;
    const response = await axios.post(
      `${BASE_URL_BSP}/api/powerPlanEnergySchedule`,
      powerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP3}}
    );
    expect(response.status).equal(201);
    powerPlanEnergyScheduleListInserted.push({
      data: response.data,
      token: tokenBSP3
    });
    console.info('[===================      ]');
  });

  it('Insert PowerPlanEnergySchedule 8 20200117', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData20200117[7];
    powerPlanEnergySchedule.edpRegisteredResourceId = edpListInserted.find(
      (edp: EDP) =>
        edp.edpRegisteredResourceMrid ===
        powerPlanEnergySchedule.edpRegisteredResourceMrid
    ).edpRegisteredResourceId;
    const response = await axios.post(
      `${BASE_URL_BSP}/api/powerPlanEnergySchedule`,
      powerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP3}}
    );
    expect(response.status).equal(201);
    powerPlanEnergyScheduleListInserted.push({
      data: response.data,
      token: tokenBSP3
    });
  });

  it('Insert PowerPlanEnergySchedule 1 20200204', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData20200204[0];
    powerPlanEnergySchedule.edpRegisteredResourceId = edpListInserted.find(
      (edp: EDP) =>
        edp.edpRegisteredResourceMrid ===
        powerPlanEnergySchedule.edpRegisteredResourceMrid
    ).edpRegisteredResourceId;
    const response = await axios.post(
      `${BASE_URL_BSP}/api/powerPlanEnergySchedule`,
      powerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP1}}
    );
    expect(response.status).equal(201);
    powerPlanEnergyScheduleListInserted.push({
      data: response.data,
      token: tokenBSP1
    });
    console.info('[================         ]');
  });

  it('Insert PowerPlanEnergySchedule 2 20200204', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData20200204[1];
    powerPlanEnergySchedule.edpRegisteredResourceId = edpListInserted.find(
      (edp: EDP) =>
        edp.edpRegisteredResourceMrid ===
        powerPlanEnergySchedule.edpRegisteredResourceMrid
    ).edpRegisteredResourceId;
    const response = await axios.post(
      `${BASE_URL_BSP}/api/powerPlanEnergySchedule`,
      powerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP1}}
    );
    expect(response.status).equal(201);
    powerPlanEnergyScheduleListInserted.push({
      data: response.data,
      token: tokenBSP1
    });
  });

  it('Insert PowerPlanEnergySchedule 3 20200204', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData20200204[2];
    powerPlanEnergySchedule.edpRegisteredResourceId = edpListInserted.find(
      (edp: EDP) =>
        edp.edpRegisteredResourceMrid ===
        powerPlanEnergySchedule.edpRegisteredResourceMrid
    ).edpRegisteredResourceId;
    const response = await axios.post(
      `${BASE_URL_BSP}/api/powerPlanEnergySchedule`,
      powerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP1}}
    );
    expect(response.status).equal(201);
    powerPlanEnergyScheduleListInserted.push({
      data: response.data,
      token: tokenBSP1
    });
    console.info('[=================        ]');
  });

  it('Insert PowerPlanEnergySchedule 4 20200204', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData20200204[3];
    powerPlanEnergySchedule.edpRegisteredResourceId = edpListInserted.find(
      (edp: EDP) =>
        edp.edpRegisteredResourceMrid ===
        powerPlanEnergySchedule.edpRegisteredResourceMrid
    ).edpRegisteredResourceId;
    const response = await axios.post(
      `${BASE_URL_BSP}/api/powerPlanEnergySchedule`,
      powerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP1}}
    );
    expect(response.status).equal(201);
    powerPlanEnergyScheduleListInserted.push({
      data: response.data,
      token: tokenBSP1
    });
  });

  it('Insert PowerPlanEnergySchedule 5 20200204', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData20200204[4];
    powerPlanEnergySchedule.edpRegisteredResourceId = edpListInserted.find(
      (edp: EDP) =>
        edp.edpRegisteredResourceMrid ===
        powerPlanEnergySchedule.edpRegisteredResourceMrid
    ).edpRegisteredResourceId;
    const response = await axios.post(
      `${BASE_URL_BSP}/api/powerPlanEnergySchedule`,
      powerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP2}}
    );
    expect(response.status).equal(201);
    powerPlanEnergyScheduleListInserted.push({
      data: response.data,
      token: tokenBSP2
    });
    console.info('[==================       ]');
  });

  it('Insert PowerPlanEnergySchedule 6 20200204', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData20200204[5];
    powerPlanEnergySchedule.edpRegisteredResourceId = edpListInserted.find(
      (edp: EDP) =>
        edp.edpRegisteredResourceMrid ===
        powerPlanEnergySchedule.edpRegisteredResourceMrid
    ).edpRegisteredResourceId;
    const response = await axios.post(
      `${BASE_URL_BSP}/api/powerPlanEnergySchedule`,
      powerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP3}}
    );
    expect(response.status).equal(201);
    powerPlanEnergyScheduleListInserted.push({
      data: response.data,
      token: tokenBSP3
    });
  });

  it('Insert PowerPlanEnergySchedule 7 20200204', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData20200204[6];
    powerPlanEnergySchedule.edpRegisteredResourceId = edpListInserted.find(
      (edp: EDP) =>
        edp.edpRegisteredResourceMrid ===
        powerPlanEnergySchedule.edpRegisteredResourceMrid
    ).edpRegisteredResourceId;
    const response = await axios.post(
      `${BASE_URL_BSP}/api/powerPlanEnergySchedule`,
      powerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP3}}
    );
    expect(response.status).equal(201);
    powerPlanEnergyScheduleListInserted.push({
      data: response.data,
      token: tokenBSP3
    });
    console.info('[===================      ]');
  });

  it('Insert PowerPlanEnergySchedule 8 20200204', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData20200204[7];
    powerPlanEnergySchedule.edpRegisteredResourceId = edpListInserted.find(
      (edp: EDP) =>
        edp.edpRegisteredResourceMrid ===
        powerPlanEnergySchedule.edpRegisteredResourceMrid
    ).edpRegisteredResourceId;
    const response = await axios.post(
      `${BASE_URL_BSP}/api/powerPlanEnergySchedule`,
      powerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP3}}
    );
    expect(response.status).equal(201);
    powerPlanEnergyScheduleListInserted.push({
      data: response.data,
      token: tokenBSP3
    });
  });

  /**
   * CREATE OrderActivationDocument / END OrderActivationDocument
   * INSERTED BY TSO
   */
  it('Insert orderActivationDocument for automata 750 20200117', async () => {
    const orderActivationDocument: OrderActivationDocument =
      orderActivationDocumentCreateData20201231[0];
    const response = await axios.post(
      `${BASE_URL_TSO}/api/orderActivationDocument`,
      orderActivationDocument,
      {
        headers: {'x-access-token': tokenTSO1}
      }
    );
    expect(response.status).equal(201);
    const createdOrderActivationDocument: OrderActivationDocument =
      response.data;
    orderActivationDocumentInserted20200101.push(
      createdOrderActivationDocument
    );
    console.info('[====================     ]');
  });

  it('End orderActivationDocument for automata 750 20200101', async () => {
    const orderActivationDocumentEnd: OrderActivationDocument =
      orderActivationDocumentEndData20200101[0];
    const orderActivationDocument = orderActivationDocumentInserted20200101.find(
      (or: any) =>
        or.orderActivationDocument.nazaRegisteredResourceMrid ===
        orderActivationDocumentEnd.nazaRegisteredResourceMrid
    );
    const response = await axios.put(
      `${BASE_URL_TSO}/api/order/orderBySiteActivationDocument/end/${orderActivationDocument.orderActivationDocument.orderId}`,
      orderActivationDocumentEnd,
      {headers: {'x-access-token': tokenTSO1}}
    );
    expect(response.status).equal(200);
  });

  it('Insert orderActivationDocument for automata 750 20200117', async () => {
    const orderActivationDocument: OrderActivationDocument =
      orderActivationDocumentCreateData20200117[0];
    const response = await axios.post(
      `${BASE_URL_TSO}/api/orderActivationDocument`,
      orderActivationDocument,
      {
        headers: {'x-access-token': tokenTSO1}
      }
    );
    expect(response.status).equal(201);
    const createdOrderActivationDocument: OrderActivationDocument =
      response.data;
    orderActivationDocumentInserted20200117.push(
      createdOrderActivationDocument
    );
    console.info('[====================     ]');
  });

  it('End orderActivationDocument for automata 750 20200117', async () => {
    const orderActivationDocumentEnd: OrderActivationDocument =
      orderActivationDocumentEndData20200117[0];
    const orderActivationDocument = orderActivationDocumentInserted20200117.find(
      (or: any) =>
        or.orderActivationDocument.nazaRegisteredResourceMrid ===
        orderActivationDocumentEnd.nazaRegisteredResourceMrid
    );
    const response = await axios.put(
      `${BASE_URL_TSO}/api/order/orderBySiteActivationDocument/end/${orderActivationDocument.orderActivationDocument.orderId}`,
      orderActivationDocumentEnd,
      {headers: {'x-access-token': tokenTSO1}}
    );
    expect(response.status).equal(200);
  });

  it('Insert orderActivationDocument for automata 516 20200117', async () => {
    const orderActivationDocument: OrderActivationDocument =
      orderActivationDocumentCreateData20200117[1];
    const response = await axios.post(
      `${BASE_URL_TSO}/api/orderActivationDocument`,
      orderActivationDocument,
      {
        headers: {'x-access-token': tokenTSO1}
      }
    );
    expect(response.status).equal(201);
    const createdOrderActivationDocument: OrderActivationDocument =
      response.data;
    orderActivationDocumentInserted20200117.push(
      createdOrderActivationDocument
    );
  });

  it('End orderActivationDocument for automata 516 20200117', async () => {
    const orderActivationDocumentEnd: OrderActivationDocument =
      orderActivationDocumentEndData20200117[1];
    const orderActivationDocument = orderActivationDocumentInserted20200117.find(
      (or: any) =>
        or.orderActivationDocument.nazaRegisteredResourceMrid ===
        orderActivationDocumentEnd.nazaRegisteredResourceMrid
    );
    const response = await axios.put(
      `${BASE_URL_TSO}/api/order/orderBySiteActivationDocument/end/${orderActivationDocument.orderActivationDocument.orderId}`,
      orderActivationDocumentEnd,
      {headers: {'x-access-token': tokenTSO1}}
    );
    expect(response.status).equal(200);
    console.info('[======================   ]');
  });

  it('Insert orderActivationDocument for automata 037 20200117', async () => {
    const orderActivationDocument: OrderActivationDocument =
      orderActivationDocumentCreateData20200117[2];
    const response = await axios.post(
      `${BASE_URL_TSO}/api/orderActivationDocument`,
      orderActivationDocument,
      {
        headers: {'x-access-token': tokenTSO1}
      }
    );
    expect(response.status).equal(201);
    const createdOrderActivationDocument: OrderActivationDocument =
      response.data;
    orderActivationDocumentInserted20200117.push(
      createdOrderActivationDocument
    );
    console.info('[=====================    ]');
  });

  it('End orderActivationDocument for automata 037 20200117', async () => {
    const orderActivationDocumentEnd: OrderActivationDocument =
      orderActivationDocumentEndData20200117[2];
    const orderActivationDocument = orderActivationDocumentInserted20200117.find(
      (or: any) =>
        or.orderActivationDocument.nazaRegisteredResourceMrid ===
        orderActivationDocumentEnd.nazaRegisteredResourceMrid
    );
    const response = await axios.put(
      `${BASE_URL_TSO}/api/order/orderBySiteActivationDocument/end/${orderActivationDocument.orderActivationDocument.orderId}`,
      orderActivationDocumentEnd,
      {headers: {'x-access-token': tokenTSO1}}
    );
    expect(response.status).equal(200);
  });

  it('Insert orderActivationDocument for automata AUT750 20200204', async () => {
    const orderActivationDocument: OrderActivationDocument =
      orderActivationDocumentCreateData20200204[0];
    const response = await axios.post(
      `${BASE_URL_TSO}/api/orderActivationDocument`,
      orderActivationDocument,
      {
        headers: {'x-access-token': tokenTSO1}
      }
    );
    expect(response.status).equal(201);
    const createdOrderActivationDocument: OrderActivationDocument =
      response.data;
    orderActivationDocumentInserted20200204.push(
      createdOrderActivationDocument
    );
    console.info('[=====================    ]');
  });

  it('Insert orderActivationDocument for automata AUT516 20200204', async () => {
    const orderActivationDocument: OrderActivationDocument =
      orderActivationDocumentCreateData20200204[2];
    const response = await axios.post(
      `${BASE_URL_TSO}/api/orderActivationDocument`,
      orderActivationDocument,
      {
        headers: {'x-access-token': tokenTSO1}
      }
    );
    expect(response.status).equal(201);
    const createdOrderActivationDocument: OrderActivationDocument =
      response.data;
    orderActivationDocumentInserted20200204.push(
      createdOrderActivationDocument
    );
    console.info('[=====================    ]');
  });

  it('Insert orderActivationDocument for automata AUT972 20200204', async () => {
    const orderActivationDocument: OrderActivationDocument =
      orderActivationDocumentCreateData20200204[3];
    const response = await axios.post(
      `${BASE_URL_TSO}/api/orderActivationDocument`,
      orderActivationDocument,
      {
        headers: {'x-access-token': tokenTSO1}
      }
    );
    expect(response.status).equal(201);
    const createdOrderActivationDocument: OrderActivationDocument =
      response.data;
    orderActivationDocumentInserted20200204.push(
      createdOrderActivationDocument
    );
    console.info('[=====================    ]');
  });

  it('End orderActivationDocument for automata AUT750 20200204', async () => {
    const orderActivationDocumentEnd: OrderActivationDocument =
      orderActivationDocumentEndData20200204[0];
    const orderActivationDocument = orderActivationDocumentInserted20200204.find(
      (or: any) =>
        or.orderActivationDocument.nazaRegisteredResourceMrid ===
        orderActivationDocumentEnd.nazaRegisteredResourceMrid
    );
    const response = await axios.put(
      `${BASE_URL_TSO}/api/order/orderBySiteActivationDocument/end/${orderActivationDocument.orderActivationDocument.orderId}`,
      orderActivationDocumentEnd,
      {headers: {'x-access-token': tokenTSO1}}
    );
    expect(response.status).equal(200);
  });

  it('End orderActivationDocument for automata AUT516 20200204', async () => {
    const orderActivationDocumentEnd: OrderActivationDocument =
      orderActivationDocumentEndData20200204[2];
    const orderActivationDocument = orderActivationDocumentInserted20200204.find(
      (or: any) =>
        or.orderActivationDocument.nazaRegisteredResourceMrid ===
        orderActivationDocumentEnd.nazaRegisteredResourceMrid
    );
    const response = await axios.put(
      `${BASE_URL_TSO}/api/order/orderBySiteActivationDocument/end/${orderActivationDocument.orderActivationDocument.orderId}`,
      orderActivationDocumentEnd,
      {headers: {'x-access-token': tokenTSO1}}
    );
    expect(response.status).equal(200);
  });

  it('End orderActivationDocument for automata AUT972 20200204', async () => {
    const orderActivationDocumentEnd: OrderActivationDocument =
      orderActivationDocumentEndData20200204[3];
    const orderActivationDocument = orderActivationDocumentInserted20200204.find(
      (or: any) =>
        or.orderActivationDocument.nazaRegisteredResourceMrid ===
        orderActivationDocumentEnd.nazaRegisteredResourceMrid
    );
    const response = await axios.put(
      `${BASE_URL_TSO}/api/order/orderBySiteActivationDocument/end/${orderActivationDocument.orderActivationDocument.orderId}`,
      orderActivationDocumentEnd,
      {headers: {'x-access-token': tokenTSO1}}
    );
    expect(response.status).equal(200);
  });

  /**
   * Check EDA BY TSO
   */
  it('Check all inserted EDA', async () => {
    let id: string = '';
    for (const eda of edaListInserted) {
      id = eda.edaRegisteredResourceId;
      const response = await axios.get(`${BASE_URL_TSO}/api/eda/${id}`, {
        headers: {'x-access-token': tokenTSO1}
      });
      expect(response.status).equal(200);
      expect(response.data.edaRegisteredResourceId).equal(
        eda.edaRegisteredResourceId
      );
      expect(response.data.a46Name).equal(eda.a46Name);
      expect(response.data.edaRegisteredResourceName).equal(
        eda.edaRegisteredResourceName
      );
      expect(response.data.a46IEC).equal(eda.a46IEC);
      expect(response.data.edaRegisteredResourceMrid).equal(
        eda.edaRegisteredResourceMrid
      );
    }

    console.info('[=======================  ]');
  });

  /**
   * Check HV BY TSO
   */
  it('Check all inserted HV value', async () => {
    let id: string = '';
    for (const hv of hvListInserted) {
      id = hv.energyAccountMarketDocumentMrid;
      const response = await axios.get(
        `${BASE_URL_TSO}/api/comptage/HV/${id}`,
        {headers: {'x-access-token': tokenTSO1}}
      );
      expect(response.status).equal(200);
      expect(response.data.energyAccountMarketDocumentMrid).equal(
        hv.energyAccountMarketDocumentMrid
      );
      expect(response.data.siteId).equal(hv.siteId);
      expect(response.data.ppeSiteCode).equal(hv.ppeSiteCode);
      expect(response.data.timeIntervalStart).equal(hv.timeIntervalStart);
      expect(response.data.timeIntervalEnd).equal(hv.timeIntervalEnd);
    }
  });

  /**
   * Check EDP BY TSO
   */
  it('Check all inserted EDP value', async () => {
    let id: string = '';
    for (const edp of edpListInserted) {
      id = edp.edpRegisteredResourceId;
      const response = await axios.get(`${BASE_URL_TSO}/api/edp/${id}`, {
        headers: {'x-access-token': tokenTSO1}
      });
      expect(response.status).equal(200);
      expect(response.data.edpRegisteredResourceId).equal(
        edp.edpRegisteredResourceId
      );
      expect(response.data.siteId).equal(edp.siteId);
      expect(response.data.edpRegisteredResourceMrid).equal(
        edp.edpRegisteredResourceMrid
      );
      expect(response.data.edpRegisteredResourceName).equal(
        edp.edpRegisteredResourceName
      );
    }
    console.info('[======================== ]');
  });

  /**
   * Check BID BY BSP
   */
  it('Check all inserted BID value', async () => {
    let id: string = '';
    for (const bidInsertion of bidListInserted) {
      const bid = bidInsertion.data;

      id = bid.bidId;
      const response = await axios.get(`${BASE_URL_BSP}/api/bid/${id}`, {
        headers: {'x-access-token': bidInsertion.token}
      });
      expect(response.status).equal(200);
      expect(response.data.bidId).equal(bid.bidId);
      expect(response.data.edaRegisteredResourceId).equal(
        bid.edaRegisteredResourceId
      );
      expect(response.data.edaRegisteredResourceMrid).equal(
        bid.edaRegisteredResourceMrid
      );
      expect(response.data.bidRegisteredResourceMrid).equal(
        bid.bidRegisteredResourceMrid
      );
    }
  });

  /**
   * Check PowerPlanEnergySchedule BY BSP
   */
  it('Check all inserted PowerPlanEnergySchedule value', async () => {
    let id: string = '';
    for (const powerPlanEnergyScheduleInsertion of powerPlanEnergyScheduleListInserted) {
      const powerPlanEnergySchedule: PowerPlanEnergySchedule =
        powerPlanEnergyScheduleInsertion.data;

      id = powerPlanEnergySchedule.powerPlanEnergyScheduleId;
      const response = await axios.get(
        `${BASE_URL_BSP}/api/powerPlanEnergySchedule/${id}`,
        {
          headers: {'x-access-token': powerPlanEnergyScheduleInsertion.token}
        }
      );
      expect(response.status).equal(200);
      expect(response.data.powerPlanEnergyScheduleId).equal(
        powerPlanEnergySchedule.powerPlanEnergyScheduleId
      );
      expect(response.data.edpRegisteredResourceId).equal(
        powerPlanEnergySchedule.edpRegisteredResourceId
      );
      expect(response.data.edpRegisteredResourceMrid).equal(
        powerPlanEnergySchedule.edpRegisteredResourceMrid
      );
    }
    console.info('[=========================]');
  });

  /**
   * Check SITE BY DSO
   */
  it('Check all inserted site value', async () => {
    let id: string = '';
    for (const siteInsertion of siteListInserted) {
      const site: Site = siteInsertion.data;

      id = site.siteId;
      const response = await axios.get(`${BASE_URL_TSO}/api/site/${id}`, {
        headers: {'x-access-token': tokenTSO1}
      });
      expect(response.status).equal(200);
      expect(response.data.siteId).equal(site.siteId);
      expect(response.data.edaRegisteredResourceId).equal(
        site.edaRegisteredResourceId
      );
      expect(response.data.voltageType).equal(site.voltageType);
      expect(response.data.objectAggregationMeteringPoint).equal(
        site.objectAggregationMeteringPoint
      );
      expect(response.data.siteIEC).equal(site.siteIEC);
      expect(response.data.a04Name).equal(site.a04Name);
    }
  });

  /**
   * Check SITE BY MV
   */
  it('Check all inserted mv value', async () => {
    let id: string = '';
    for (const mvInsertion of mvListInserted) {
      const mv: MV = mvInsertion.data;

      id = mv.energyAccountMarketDocumentMrid;
      const response = await axios.get(
        `${BASE_URL_DSO}/api/comptage/HV/${id}`,
        {headers: {'x-access-token': mvInsertion.token}}
      );
      expect(response.status).equal(200);
      expect(response.data.energyAccountMarketDocumentMrid).equal(
        mv.energyAccountMarketDocumentMrid
      );
      expect(response.data.objectAggregationMeteringPoint).equal(
        mv.objectAggregationMeteringPoint
      );
      expect(response.data.siteId).equal(mv.siteId);
    }
  });
});
