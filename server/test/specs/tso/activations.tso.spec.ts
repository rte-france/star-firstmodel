/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import axios from 'axios';
import {PowerPlanEnergySchedule} from '../../../src/models/PowerPlanEnergySchedule';
import {MV} from '../../../src/models/MV';
import {EDP} from '../../../src/models/EDP';
import {Bid} from '../../../src/models/Bid';
import {Site} from '../../../src/models/Site';
import {Activation} from '../../../src/models/Activation';
import {expect} from 'chai';
import {loginHelper} from '../../helpers/Login.helper';
import {Environment} from '../../../config/Environment';
import {EDA} from '../../../src/models/EDA';
import {EDAHelper} from '../../helpers/EDA.helper';
import {SiteHelper} from '../../helpers/Site.helper';
import {SiteType} from '../../enums/SiteType';
import {BidHelper} from '../../helpers/Bid.helper';
import {EDPHelper} from '../../helpers/EDP.helper';
import {PowerPlanEnergyScheduleHelper} from '../../helpers/PowerPlanEnergySchedule.helper';
import {OrderActivationDocument} from '../../../src/models/OrderActivationDocument';
import {OrderActivationDocumentHelper} from '../../helpers/OrderActivationDocument.helper';
import {MVHelper} from '../../helpers/MVHelper';

let tokenTSO1: string;
let tokenDSO1: string;
let tokenBSP1: string;

const mockEDA: EDA = new EDAHelper().createEda('BSP1', '7Y778300000I');
const mockMVSite: Site = new SiteHelper().createSite(
  ['automate100'],
  'DSO1',
  SiteType.MV,
  'PRM00000000234766',
  'EolienMistral'
);
const mockBid: Bid = new BidHelper().createBid('7Y778300000I');
const mockEDP: EDP = new EDPHelper().createEdp('edpRegisteredResourceMrid');
const mockPowerPlanEnergySchedule: PowerPlanEnergySchedule = new PowerPlanEnergyScheduleHelper().createPowerPlanEnergySchedule(
  'edpRegisteredResourceMrid'
);
const mockOrderActivationDocument: OrderActivationDocument = new OrderActivationDocumentHelper().createOrderActivationDocument(
  'automate100',
  ['codeSite'],
  ['DSO1']
);
const mockOrderActivationDocumentEnd: OrderActivationDocument = new OrderActivationDocumentHelper().createOrderActivationDocument(
  'automate100',
  ['codeSite'],
  ['DSO1']
);
const mockMV: MV = new MVHelper().createMV('PRM00000000234766');

describe('Activation rest test', function(): void {
  jest.setTimeout(300000);

  beforeAll(async () => {
    tokenTSO1 = await loginHelper(Environment.baseUrlTSO, 'user.star@tso1.com');
    tokenDSO1 = await loginHelper(Environment.baseUrlDSO, 'user.star@dso1.com');
    tokenBSP1 = await loginHelper(Environment.baseUrlBSP, 'user.star@bsp1.com');
  });

  it('should be able to get all activations', async () => {
    const createEDAResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/eda/`,
      mockEDA,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const site: Site = mockMVSite;
    site.edaRegisteredResourceId =
      createEDAResponse.data.edaRegisteredResourceId;
    const bid: Bid = mockBid;
    bid.edaRegisteredResourceId =
      createEDAResponse.data.edaRegisteredResourceId;
    bid.edaRegisteredResourceMrid =
      createEDAResponse.data.edaRegisteredResourceMrid;

    const createSiteResponse = await axios.post(
      `${Environment.baseUrlDSO}/api/site/`,
      site,
      {headers: {'x-access-token': tokenDSO1}}
    );
    const mv: MV = mockMV;
    mv.siteId = createSiteResponse.data.siteId;

    const edp: EDP = mockEDP;
    edp.siteId = createSiteResponse.data.siteId;

    await axios.post(`${Environment.baseUrlBSP}/api/bid/`, bid, {
      headers: {'x-access-token': tokenBSP1}
    });
    await axios.post(`${Environment.baseUrlDSO}/api/comptage/MV/`, mv, {
      headers: {'x-access-token': tokenDSO1}
    });

    const createEDPResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/edp/`,
      edp,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const powerPlanEnergySchedule: PowerPlanEnergySchedule = mockPowerPlanEnergySchedule;
    powerPlanEnergySchedule.edpRegisteredResourceId =
      createEDPResponse.data.edpRegisteredResourceId;
    powerPlanEnergySchedule.edpRegisteredResourceMrid =
      createEDPResponse.data.edpRegisteredResourceMrid;

    const createPowerPlanEnergyScheduleResponse = await axios.post(
      `${Environment.baseUrlBSP}/api/powerPlanEnergySchedule/`,
      powerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP1}}
    );
    powerPlanEnergySchedule.powerPlanEnergyScheduleId =
      createPowerPlanEnergyScheduleResponse.data.powerPlanEnergyScheduleId;
    const createOrderActivationDocumentResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/orderActivationDocument/`,
      mockOrderActivationDocument,
      {headers: {'x-access-token': tokenTSO1}}
    );

    mockOrderActivationDocumentEnd.createdDateTime = '1572188400';
    await axios.put(
      `${Environment.baseUrlTSO}/api/order/orderBySiteActivationDocument/end/${createOrderActivationDocumentResponse.data.orderActivationDocument.orderId}`,
      mockOrderActivationDocumentEnd,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const getAllActivationsResponse = await axios.get(
      `${Environment.baseUrlTSO}/api/activations/all`,
      {headers: {'x-access-token': tokenTSO1}}
    );

    const activations: Activation[] = getAllActivationsResponse.data;
    const activation: Activation = activations.find(
      (currentActivation) =>
        currentActivation.powerPlanEnergyScheduleIds[0] ===
        powerPlanEnergySchedule.powerPlanEnergyScheduleId
    );

    expect(activation.powerPlanEnergyScheduleIds[0]).equal(
      powerPlanEnergySchedule.powerPlanEnergyScheduleId
    );
    expect(activation.dataPowerPlanEnergySchedule.length).greaterThan(0);
    expect(activation.timeSeries.length).greaterThan(0);
  });
});
