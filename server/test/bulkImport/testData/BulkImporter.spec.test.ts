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
const BASE_URL_TSO: string = 'http://localhost:5000';
const BASE_URL_DSO: string = 'http://localhost:5001';
const BASE_URL_BSP: string = 'http://localhost:5002';

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
let tokenBSP1: string;

const edaData: EDA[] = require('./asset/eda.json');
const edaListInserted: EDA[] = [];

const bidData: Bid[] = require('./asset/bid.json');
const bidListInserted: Bid[] = [];

const siteData: Site[] = require('./asset/sites.json');
const siteListInserted: Site[] = [];

const mvData: MV[] = require('./asset/mv.json');
const mvListInserted: MV[] = [];

const hvData: HV[] = require('./asset/hv.json');
const hvListInserted: HV[] = [];

const edpData: EDP[] = require('./asset/edp.json');
const edpListInserted: EDP[] = [];

const powerPlanEnergyScheduleData: PowerPlanEnergySchedule[] = require('./asset/powerPlanEnergySchedule.json');
const powerPlanEnergyScheduleListInserted: PowerPlanEnergySchedule[] = [];

const orderCreateData: OrderActivationDocument[] = require('./asset/orderActivationDocumentCreate.json');
const orderCreateInserted: OrderActivationDocument[] = [];

const orderEndData: OrderActivationDocument[] = require('./asset/orderActivationDocumentEnd.json');

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
    const responseDSO2 = await axios.post(
      `${BASE_URL_DSO}/api/auth/login`,
      {userEmail: 'user.star@dso2.com', password: 'passw0rd'},
      {headers: {'Content-Type': 'application/json'}}
    );
    tokenDSO2 = responseDSO2.data.token;
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
    const bid: Bid = bidData[0];
    bid.edaRegisteredResourceId = edaListInserted.find(
      (eda: EDA) =>
        eda.edaRegisteredResourceMrid === bid.edaRegisteredResourceMrid
    ).edaRegisteredResourceId;
    const response = await axios.post(`${BASE_URL_BSP}/api/bid`, bid, {
      headers: {'x-access-token': tokenBSP1}
    });
    expect(response.status).equal(201);
    bidListInserted.push(response.data);
  });

  it('Insert BID 2', async () => {
    const bid: Bid = bidData[1];
    bid.edaRegisteredResourceId = edaListInserted.find(
      (eda: EDA) =>
        eda.edaRegisteredResourceMrid === bid.edaRegisteredResourceMrid
    ).edaRegisteredResourceId;
    const response = await axios.post(`${BASE_URL_BSP}/api/bid`, bid, {
      headers: {'x-access-token': tokenBSP1}
    });
    expect(response.status).equal(201);
    bidListInserted.push(response.data);
    console.info('[===                      ]');
  });

  it('Insert BID 3', async () => {
    const bid: Bid = bidData[2];
    bid.edaRegisteredResourceId = edaListInserted.find(
      (eda: EDA) =>
        eda.edaRegisteredResourceMrid === bid.edaRegisteredResourceMrid
    ).edaRegisteredResourceId;
    const response = await axios.post(`${BASE_URL_BSP}/api/bid`, bid, {
      headers: {'x-access-token': tokenBSP1}
    });
    expect(response.status).equal(201);
    bidListInserted.push(response.data);
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
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    const createdSite: Site = response.data;
    siteListInserted.push(createdSite);
    console.info('[====                     ]');
  });

  it('Insert SITE 2', async () => {
    const site: Site = siteData[1];
    site.edaRegisteredResourceId = edaListInserted.find(
      (eda: EDA) =>
        eda.edaRegisteredResourceMrid === site.edaRegisteredResourceId
    ).edaRegisteredResourceId;
    const response = await axios.post(`${BASE_URL_DSO}/api/site`, site, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    const createdSite: Site = response.data;
    siteListInserted.push(createdSite);
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
    siteListInserted.push(createdSite);
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
    siteListInserted.push(createdSite);
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
    siteListInserted.push(createdSite);
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
    siteListInserted.push(createdSite);
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
    siteListInserted.push(createdSite);
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
    siteListInserted.push(createdSite);
  });

  /**
   * HV INSERTION
   * INSERTION BY TSO
   */
  it('Insert HV 1', async () => {
    const hv: HV = hvData[0];
    hv.siteId = siteListInserted.find(
      (site: Site) => site.objectAggregationMeteringPoint === hv.ppeSiteCode
    ).siteId;
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
  it('Insert MV 1', async () => {
    const mv: MV = mvData[0];
    mv.siteId = siteListInserted.find(
      (site: Site) =>
        site.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    mvListInserted.push(response.data);
  });

  it('Insert MV 2', async () => {
    const mv: MV = mvData[1];
    mv.siteId = siteListInserted.find(
      (site: Site) =>
        site.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    mvListInserted.push(response.data);
    console.info('[=========                ]');
  });

  it('Insert MV 3', async () => {
    const mv: MV = mvData[2];
    mv.siteId = siteListInserted.find(
      (site: Site) =>
        site.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    mvListInserted.push(response.data);
  });

  it('Insert MV 4', async () => {
    const mv: MV = mvData[3];
    mv.siteId = siteListInserted.find(
      (site: Site) =>
        site.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    mvListInserted.push(response.data);
    console.info('[==========               ]');
  });

  it('Insert MV 5', async () => {
    const mv: MV = mvData[4];
    mv.siteId = siteListInserted.find(
      (site: Site) =>
        site.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    mvListInserted.push(response.data);
  });

  it('Insert MV 6', async () => {
    const mv: MV = mvData[5];
    mv.siteId = siteListInserted.find(
      (site: Site) =>
        site.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    mvListInserted.push(response.data);
    console.info('[===========              ]');
  });

  it('Insert MV 7', async () => {
    const mv: MV = mvData[6];
    mv.siteId = siteListInserted.find(
      (site: Site) =>
        site.objectAggregationMeteringPoint ===
        mv.objectAggregationMeteringPoint
    ).siteId;
    const response = await axios.post(`${BASE_URL_DSO}/api/comptage/MV`, mv, {
      headers: {'x-access-token': tokenDSO2}
    });
    expect(response.status).equal(201);
    mvListInserted.push(response.data);
  });

  /**
   * EDP INSERTION
   * INSERTION BY TSO
   */
  it('Insert EDP 1', async () => {
    const edp: EDP = edpData[0];
    edp.siteId = siteListInserted.find(
      (site: Site) => site.objectAggregationMeteringPoint === edp.siteId
    ).siteId;
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
      (site: Site) => site.objectAggregationMeteringPoint === edp.siteId
    ).siteId;
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
      (site: Site) => site.objectAggregationMeteringPoint === edp.siteId
    ).siteId;
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
      (site: Site) => site.objectAggregationMeteringPoint === edp.siteId
    ).siteId;
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
      (site: Site) => site.objectAggregationMeteringPoint === edp.siteId
    ).siteId;
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
      (site: Site) => site.objectAggregationMeteringPoint === edp.siteId
    ).siteId;
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
      (site: Site) => site.objectAggregationMeteringPoint === edp.siteId
    ).siteId;
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
      (site: Site) => site.objectAggregationMeteringPoint === edp.siteId
    ).siteId;
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
  it('Insert PowerPlanEnergySchedule 1', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData[0];
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
    powerPlanEnergyScheduleListInserted.push(response.data);
    console.info('[================         ]');
  });

  it('Insert PowerPlanEnergySchedule 2', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData[1];
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
    powerPlanEnergyScheduleListInserted.push(response.data);
  });

  it('Insert PowerPlanEnergySchedule 3', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData[2];
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
    powerPlanEnergyScheduleListInserted.push(response.data);
    console.info('[=================        ]');
  });

  it('Insert PowerPlanEnergySchedule 4', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData[3];
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
    powerPlanEnergyScheduleListInserted.push(response.data);
  });

  it('Insert PowerPlanEnergySchedule 5', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData[4];
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
    powerPlanEnergyScheduleListInserted.push(response.data);
    console.info('[==================       ]');
  });

  it('Insert PowerPlanEnergySchedule 6', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData[5];
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
    powerPlanEnergyScheduleListInserted.push(response.data);
  });

  it('Insert PowerPlanEnergySchedule 7', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData[6];
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
    powerPlanEnergyScheduleListInserted.push(response.data);
    console.info('[===================      ]');
  });

  it('Insert PowerPlanEnergySchedule 8', async () => {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule =
      powerPlanEnergyScheduleData[7];
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
    powerPlanEnergyScheduleListInserted.push(response.data);
  });

  /**
   * CREATE ORDER
   * INSERTED BY TSO
   */
  it('Insert Order for automata 750', async () => {
    const order: OrderActivationDocument = orderCreateData[0];
    const response = await axios.post(`${BASE_URL_TSO}/api/order`, order, {
      headers: {'x-access-token': tokenTSO1}
    });
    expect(response.status).equal(201);
    const createdOrder: OrderActivationDocument = response.data;
    orderCreateInserted.push(createdOrder);
    console.info('[====================     ]');
  });

  it('Insert Order for automata 516', async () => {
    const order: OrderActivationDocument = orderCreateData[1];
    const response = await axios.post(`${BASE_URL_TSO}/api/order`, order, {
      headers: {'x-access-token': tokenTSO1}
    });
    expect(response.status).equal(201);
    const createdOrder: OrderActivationDocument = response.data;
    orderCreateInserted.push(createdOrder);
  });

  it('Insert Order for automata 972', async () => {
    const order: OrderActivationDocument = orderCreateData[2];
    const response = await axios.post(`${BASE_URL_TSO}/api/order`, order, {
      headers: {'x-access-token': tokenTSO1}
    });
    expect(response.status).equal(201);
    const createdOrder: OrderActivationDocument = response.data;
    orderCreateInserted.push(createdOrder);
    console.info('[=====================    ]');
  });

  it('End order for automata 750', async () => {
    const orderEnd: OrderActivationDocument = orderEndData[0];
    const order: OrderActivationDocument = orderCreateInserted.find(
      (or: any) =>
        or.order.nazaRegisteredResourceMrid ===
        orderEnd.nazaRegisteredResourceMrid
    );
    const response = await axios.put(
      `${BASE_URL_TSO}/api/order/orderBySiteActivationDocument/end/${order.orderId}`,
      orderEnd,
      {headers: {'x-access-token': tokenTSO1}}
    );
    expect(response.status).equal(200);
  });

  it('End order for automata 516', async () => {
    const orderEnd: OrderActivationDocument = orderEndData[1];
    const order: OrderActivationDocument = orderCreateInserted.find(
      (or: any) =>
        or.order.nazaRegisteredResourceMrid ===
        orderEnd.nazaRegisteredResourceMrid
    );
    const response = await axios.put(
      `${BASE_URL_TSO}/api/order/orderBySiteActivationDocument/end/${order.orderId}`,
      orderEnd,
      {headers: {'x-access-token': tokenTSO1}}
    );
    expect(response.status).equal(200);
    console.info('[======================   ]');
  });

  it('End order for automata 972', async () => {
    const orderEnd: OrderActivationDocument = orderEndData[2];
    const order: OrderActivationDocument = orderCreateInserted.find(
      (or: any) =>
        or.order.nazaRegisteredResourceMrid ===
        orderEnd.nazaRegisteredResourceMrid
    );
    const response = await axios.put(
      `${BASE_URL_TSO}/api/order/orderBySiteActivationDocument/end/${order.orderId}`,
      orderEnd,
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
    for (const bid of bidListInserted) {
      id = bid.bidId;
      const response = await axios.get(`${BASE_URL_BSP}/api/bid/${id}`, {
        headers: {'x-access-token': tokenBSP1}
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
    for (const powerPlanEnergySchedule of powerPlanEnergyScheduleListInserted) {
      id = powerPlanEnergySchedule.powerPlanEnergyScheduleId;
      const response = await axios.get(
        `${BASE_URL_BSP}/api/powerPlanEnergySchedule/${id}`,
        {
          headers: {'x-access-token': tokenBSP1}
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
    for (const site of siteListInserted) {
      id = site.siteId;
      const response = await axios.get(`${BASE_URL_DSO}/api/site/${id}`, {
        headers: {'x-access-token': tokenDSO2}
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
    for (const mv of mvListInserted) {
      id = mv.energyAccountMarketDocumentMrid;
      const response = await axios.get(
        `${BASE_URL_DSO}/api/comptage/HV/${id}`,
        {headers: {'x-access-token': tokenDSO2}}
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
