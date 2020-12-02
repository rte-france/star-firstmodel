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
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {initAndGetMockStub} from '../common/InitChaincode';
import {PowerPlanEnergyScheduleHelper} from '../helper/PowerPlanEnergySchedule.helper';
import {PowerPlanEnergyScheduleMockTransaction} from '../mockControllers/PowerPlanEnergyScheduleMockTransaction';
import {StatusCode} from '../enums/StatusCode';
import {QueryResponse} from '../common/QueryResponse';
import {PowerPlanEnergySchedule} from '../../src/powerPlanEnergySchedule/PowerPlanEnergySchedule';
import {EDAMockTransaction} from '../mockControllers/EDAMockTransaction';
import {SiteMockTransaction} from '../mockControllers/SiteMockTransaction';
import {EDPMockTransaction} from '../mockControllers/EDPMockTransaction';
import {EDA} from '../../src/eda/EDA';
import {EDAHelper} from '../helper/EDA.helper';
import {Site} from '../../src/site/Site';
import {SiteHelper} from '../helper/Site.helper';
import {SiteType} from '../../src/site/enums/SiteType';
import {EDP} from '../../src/edp/EDP';
import {EDPHelper} from '../helper/EDP.helper';

let mockStub: ChaincodeMockStub;
const eda: EDA = new EDAHelper().createEda(
  'ID_EDA',
  bspOrganization.organizationId
);
const site: Site = new SiteHelper().createSite(
  'siteId',
  SiteType.HV,
  'ID_EDA',
  dsoOrganization.organizationId
);
const edp: EDP = new EDPHelper().createEdp('edpRegisteredResourceId', 'siteId');
const powerPlanEnergySchedule = new PowerPlanEnergyScheduleHelper().createPowerPlanEnergySchedule(
  '1',
  'edpRegisteredResourceId'
);

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(tsoOrganizationType.mspId);
  }
);

describe('As RTE ', () => {
  it('I should not be able to create a new powerPlanEnergySchedule.', async () => {
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new PowerPlanEnergyScheduleMockTransaction(
      mockStub
    ).createPowerPlanEnergySchedule(
      powerPlanEnergySchedule,
      tsoOrganization,
      isErrorExpected
    );

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to create a PowerPlanEnergySchedule.'
    );
  });

  it('I should be able to get a powerPlanEnergySchedule by Id.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(site, tsoOrganization);
    await new EDPMockTransaction(mockStub).createEDP(edp, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new PowerPlanEnergyScheduleMockTransaction(
      mockStub
    ).createPowerPlanEnergySchedule(powerPlanEnergySchedule, bspOrganization);

    mockStub.setCreator(tsoOrganizationType.mspId);
    const queryResponse: QueryResponse<PowerPlanEnergySchedule> = await new PowerPlanEnergyScheduleMockTransaction(
      mockStub
    ).getPowerPlanEnergySchedule(
      powerPlanEnergySchedule.powerPlanEnergyScheduleId,
      tsoOrganization
    );
  });

  it('I should be able to get a powerPlanEnergySchedule from a query.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(site, tsoOrganization);
    await new EDPMockTransaction(mockStub).createEDP(edp, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new PowerPlanEnergyScheduleMockTransaction(
      mockStub
    ).createPowerPlanEnergySchedule(powerPlanEnergySchedule, bspOrganization);

    mockStub.setCreator(tsoOrganizationType.mspId);
    const queryResponse: QueryResponse<PowerPlanEnergySchedule[]> = await new PowerPlanEnergyScheduleMockTransaction(
      mockStub
    ).queryPowerPlanEnergySchedule(
      JSON.stringify({
        edpRegisteredResourceMrid:
          powerPlanEnergySchedule.edpRegisteredResourceMrid
      }),
      tsoOrganization
    );
    expect(JSON.stringify(queryResponse.payload)).equal(
      JSON.stringify([powerPlanEnergySchedule])
    );
  });

  it('I should get back an empty response when id does not exist.', async () => {
    const isErrorExpected = true;
    const queryResponse: QueryResponse<PowerPlanEnergySchedule> = await new PowerPlanEnergyScheduleMockTransaction(
      mockStub
    ).getPowerPlanEnergySchedule(
      powerPlanEnergySchedule.powerPlanEnergyScheduleId,
      tsoOrganization,
      isErrorExpected
    );

    expect(queryResponse.message.toString()).equal(
      `Error: ${powerPlanEnergySchedule.powerPlanEnergyScheduleId} does not exist.`
    );
  });
});
