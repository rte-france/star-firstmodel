/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {ChaincodeResponse} from 'fabric-shim';
import {expect} from 'chai';
import {
  bspOrganization,
  bspOrganizationType,
  dsoOrganization,
  otherBSPOrganization,
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {initAndGetMockStub} from '../common/InitChaincode';
import {PowerPlanEnergyScheduleHelper} from '../helper/PowerPlanEnergySchedule.helper';
import {PowerPlanEnergyScheduleMockTransaction} from '../mockControllers/PowerPlanEnergyScheduleMockTransaction';
import {StatusCode} from '../enums/StatusCode';
import {EDAMockTransaction} from '../mockControllers/EDAMockTransaction';
import {SiteMockTransaction} from '../mockControllers/SiteMockTransaction';
import {EDA} from '../../src/eda/EDA';
import {EDAHelper} from '../helper/EDA.helper';
import {Site} from '../../src/site/Site';
import {SiteHelper} from '../helper/Site.helper';
import {SiteType} from '../../src/site/enums/SiteType';
import {EDPMockTransaction} from '../mockControllers/EDPMockTransaction';
import {EDP} from '../../src/edp/EDP';
import {EDPHelper} from '../helper/EDP.helper';
import {QueryResponse} from '../common/QueryResponse';
import {PowerPlanEnergySchedule} from '../../src/powerPlanEnergySchedule/PowerPlanEnergySchedule';

let mockStub: ChaincodeMockStub;
const eda: EDA = new EDAHelper().createEda(
  'ID_EDA',
  bspOrganization.organizationId
);
const eda2: EDA = new EDAHelper().createEda(
  'ID_EDA2',
  otherBSPOrganization.organizationId
);
const site: Site = new SiteHelper().createSite(
  'siteId',
  SiteType.HV,
  'ID_EDA',
  dsoOrganization.organizationId
);
const site2: Site = new SiteHelper().createSite(
  'siteId2',
  SiteType.HV,
  'ID_EDA2',
  dsoOrganization.organizationId
);
const edp: EDP = new EDPHelper().createEdp('edpRegisteredResourceId', 'siteId');
const edp2: EDP = new EDPHelper().createEdp(
  'edpRegisteredResourceId2',
  'siteId2'
);
const powerPlanEnergySchedule = new PowerPlanEnergyScheduleHelper().createPowerPlanEnergySchedule(
  '1',
  'edpRegisteredResourceId'
);
const powerPlanEnergySchedule2 = new PowerPlanEnergyScheduleHelper().createPowerPlanEnergySchedule(
  '2',
  'edpRegisteredResourceId2'
);

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(bspOrganizationType.mspId);
  }
);

describe('As BSP ', () => {
  it('I should be able to create a new powerPlanEnergySchedule when I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(site, tsoOrganization);
    await new EDPMockTransaction(mockStub).createEDP(edp, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    const invokeResponse: ChaincodeResponse = await new PowerPlanEnergyScheduleMockTransaction(
      mockStub
    ).createPowerPlanEnergySchedule(powerPlanEnergySchedule, bspOrganization);

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(invokeResponse.payload.toString()).equals(
      JSON.stringify(powerPlanEnergySchedule)
    );
  });

  it('I should not be able to create a new powerPlanEnergySchedule when I do not have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(site2, tsoOrganization);
    await new EDPMockTransaction(mockStub).createEDP(edp2, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new PowerPlanEnergyScheduleMockTransaction(
      mockStub
    ).createPowerPlanEnergySchedule(
      powerPlanEnergySchedule2,
      bspOrganization,
      isErrorExpected
    );

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'Organization does not have permission to create PowerPlanEnergySchedule.'
    );
  });

  it('I should be able to get a powerPlanEnergySchedule by Id when I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(site, tsoOrganization);
    await new EDPMockTransaction(mockStub).createEDP(edp, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new PowerPlanEnergyScheduleMockTransaction(
      mockStub
    ).createPowerPlanEnergySchedule(powerPlanEnergySchedule, bspOrganization);

    const queryResponse: QueryResponse<PowerPlanEnergySchedule> = await new PowerPlanEnergyScheduleMockTransaction(
      mockStub
    ).getPowerPlanEnergySchedule(
      powerPlanEnergySchedule.powerPlanEnergyScheduleId,
      bspOrganization
    );

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(JSON.stringify(queryResponse.payload)).equals(
      JSON.stringify(powerPlanEnergySchedule)
    );
  });

  it('I should not be able to get a powerPlanEnergySchedule by Id when I do not have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(site2, tsoOrganization);
    await new EDPMockTransaction(mockStub).createEDP(edp2, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new PowerPlanEnergyScheduleMockTransaction(
      mockStub
    ).createPowerPlanEnergySchedule(
      powerPlanEnergySchedule2,
      otherBSPOrganization
    );

    const isErrorExpected = true;
    const queryResponse: QueryResponse<PowerPlanEnergySchedule> = await new PowerPlanEnergyScheduleMockTransaction(
      mockStub
    ).getPowerPlanEnergySchedule(
      powerPlanEnergySchedule2.powerPlanEnergyScheduleId,
      bspOrganization,
      isErrorExpected
    );

    expect(queryResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(queryResponse.message.toString()).to.contain(
      'Organization does not have permission to get this PowerPlanEnergySchedule.'
    );
  });

  it('I should be able to query a powerPlanEnergySchedule when I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(site, tsoOrganization);
    await new EDPMockTransaction(mockStub).createEDP(edp, tsoOrganization);

    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(site2, tsoOrganization);
    await new EDPMockTransaction(mockStub).createEDP(edp2, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new PowerPlanEnergyScheduleMockTransaction(
      mockStub
    ).createPowerPlanEnergySchedule(powerPlanEnergySchedule, bspOrganization);
    await new PowerPlanEnergyScheduleMockTransaction(
      mockStub
    ).createPowerPlanEnergySchedule(
      powerPlanEnergySchedule2,
      otherBSPOrganization
    );

    const queryResponse: QueryResponse<PowerPlanEnergySchedule[]> = await new PowerPlanEnergyScheduleMockTransaction(
      mockStub
    ).queryPowerPlanEnergySchedule(
      JSON.stringify({
        edpRegisteredResourceMrid: 'edpRegisteredResourceMrid'
      }),
      bspOrganization
    );

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(JSON.stringify(queryResponse.payload)).equals(
      JSON.stringify([powerPlanEnergySchedule])
    );
  });
});
