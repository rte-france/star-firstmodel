/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import axios from 'axios';
import {expect} from 'chai';
import {OrderBySiteActivationDocument} from '../../src/models/OrderBySiteActivationDocument';
import {Site} from '../../src/models/Site';
import {OrderActivationDocument} from '../../src/models/OrderActivationDocument';
import {EDA} from '../../src/models/EDA';
import {TimeoutDuration} from '../enums/timeoutDuration.enum';
import {Environment} from '../../config/Environment';
import {loginHelper} from '../helpers/Login.helper';
import {OrderActivationDocumentHelper} from '../helpers/OrderActivationDocument.helper';
import {SiteHelper} from '../helpers/Site.helper';
import {SiteType} from '../enums/SiteType';

let tokenTSO1: string;
let tokenDSO1: string;
let tokenBSP1: string;
let tokenPRODUCER1: string;
let siteId1: string;
let siteId2: string;
let orderId1: string;
let orderId2: string;
let idOrderBySite1: string;

const mockHVSiteDSO1: Site = new SiteHelper().createSite(
  ['automateXX'],
  'DSO1',
  SiteType.HV,
  'siteXX',
  'EolienMistral'
);
const mockHVSiteDSO2: Site = new SiteHelper().createSite(
  ['automateYY'],
  'DSO2',
  SiteType.HV,
  'siteYY',
  'EolienMistral'
);
const mockSiteForOrderActivationDocument1: Site = new SiteHelper().createSite(
  ['automate100'],
  'DSO1',
  SiteType.HV,
  'codeSite',
  'EolienMistral'
);
const mockSiteForOrderActivationDocument2: Site = new SiteHelper().createSite(
  ['NAZATEST'],
  'DSO2',
  SiteType.HV,
  'codeSite',
  'EolienAlize'
);
const secondMockSiteHV: Site = new SiteHelper().createSite(
  ['NAZATEST'],
  'DSO2',
  SiteType.HV,
  'site_02',
  'EolienMistral'
);
const thirdMockSiteHV: Site = new SiteHelper().createSite(
  ['NAZATEST'],
  'DSO2',
  SiteType.HV,
  'site_03',
  'EolienAlize'
);

const mockOrderActivationDocument: OrderActivationDocument = new OrderActivationDocumentHelper().createOrderActivationDocument(
  'automate100',
  ['codeSite'],
  ['DSO1']
);
const mockOrderActivationDocument2: OrderActivationDocument = new OrderActivationDocumentHelper().createOrderActivationDocument(
  'NAZATEST',
  ['site_01', 'site_02', 'site_03'],
  ['DSO1']
);
const mockOrderActivationDocumentDSO2: OrderActivationDocument = new OrderActivationDocumentHelper().createOrderActivationDocument(
  'AUTOMATEYY',
  ['siteYY'],
  ['DSO2']
);
const mockOrderActivationDocumentDSO1: OrderActivationDocument = new OrderActivationDocumentHelper().createOrderActivationDocument(
  'AUTOMATEXX',
  ['siteXX'],
  ['DSO1']
);

describe('OrderActivationDocument REST test', () => {
  jest.setTimeout(TimeoutDuration.fiftySeconds.valueOf());

  beforeAll(async () => {
    tokenTSO1 = await loginHelper(Environment.baseUrlTSO, 'user.star@tso1.com');
    tokenDSO1 = await loginHelper(Environment.baseUrlDSO, 'user.star@dso1.com');
    tokenBSP1 = await loginHelper(Environment.baseUrlBSP, 'user.star@bsp1.com');
    tokenPRODUCER1 = await loginHelper(
      Environment.baseUrlPRODUCER,
      'user.star@eolien-mistral.com'
    );
  });

  it('should be able to create an OrderActivationDocument as TSO1', async () => {
    const createSiteResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/site/`,
      mockSiteForOrderActivationDocument1,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const createdSite: Site = createSiteResponse.data;
    siteId1 = createdSite.siteId;

    const response = await axios.post(
      `${Environment.baseUrlTSO}/api/orderActivationDocument/`,
      mockOrderActivationDocument,
      {headers: {'x-access-token': tokenTSO1}}
    );

    const createdOrderActivationDocument: OrderActivationDocument =
      response.data.orderActivationDocument;
    const createdOrderBySiteActivationDocuments: OrderBySiteActivationDocument[] =
      response.data.orderBySiteActivationDocument;
    orderId1 = createdOrderActivationDocument.orderId;

    // Check for OrderActivationDocument
    expect(response.status).equal(201);
    expect(createdOrderActivationDocument.nazaRegisteredResourceMrid[0]).equal(
      mockOrderActivationDocument.nazaRegisteredResourceMrid[0]
    );
    expect(createdOrderActivationDocument.orderAllValue).equal(
      mockOrderActivationDocument.orderAllValue
    );
    expect(createdOrderActivationDocument.createdDateTime).equal(
      mockOrderActivationDocument.createdDateTime
    );
    expect(
      createdOrderActivationDocument.objectAggregationMeteringPoint[0]
    ).equal(mockOrderActivationDocument.objectAggregationMeteringPoint[0]);
    expect(
      createdOrderActivationDocument.objectAggregationMeteringPoint[1]
    ).equal(mockOrderActivationDocument.objectAggregationMeteringPoint[1]);

    // Check for order by Site
    idOrderBySite1 = createdOrderBySiteActivationDocuments[0].idOrderBySite;
    expect(createdOrderBySiteActivationDocuments[0].orderId).equal(orderId1);
    expect(createdOrderBySiteActivationDocuments[0].orderValue).equal(
      mockOrderActivationDocument.orderAllValue
    );
    expect(createdOrderBySiteActivationDocuments[0].logOrder.length).equal(2);
    expect(createdOrderBySiteActivationDocuments[0].logOrder[0].success).equal(
      true
    );
    expect(createdOrderBySiteActivationDocuments[0].logOrder[1].success).equal(
      true
    );
  });

  it('should not be able to create an OrderActivationDocument as DSO1', async () => {
    try {
      await axios.post(
        `${Environment.baseUrlDSO}/api/orderActivationDocument/`,
        mockOrderActivationDocument,
        {
          headers: {'x-access-token': tokenDSO1}
        }
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create an OrderActivationDocument.'
      );
    }
  });

  it('should not be able to create an OrderActivationDocument as BSP', async () => {
    try {
      await axios.post(
        `${Environment.baseUrlBSP}/api/orderActivationDocument/`,
        mockOrderActivationDocument,
        {
          headers: {'x-access-token': tokenBSP1}
        }
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
    }
  });

  it('should not be able to create an OrderActivationDocument as PRODUCER', async () => {
    try {
      await axios.post(
        `${Environment.baseUrlPRODUCER}/api/orderActivationDocument/`,
        mockOrderActivationDocument,
        {
          headers: {'x-access-token': tokenPRODUCER1}
        }
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
    }
  });

  it('should be able to get all available orderBySiteActivationDocuments', async () => {
    const response = await axios.get(
      `${Environment.baseUrlTSO}/api/order/orderBySiteActivationDocument/all`,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const queryResponse: OrderBySiteActivationDocument[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).greaterThan(0);
  });

  it('should be able to create a second OrderActivationDocument', async () => {
    await axios.post(`${Environment.baseUrlTSO}/api/site/`, secondMockSiteHV, {
      headers: {'x-access-token': tokenTSO1}
    });
    await axios.post(`${Environment.baseUrlTSO}/api/site/`, thirdMockSiteHV, {
      headers: {'x-access-token': tokenTSO1}
    });

    const response = await axios.post(
      `${Environment.baseUrlTSO}/api/orderActivationDocument/`,
      mockOrderActivationDocument2,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const createdOrderActivationDocument: OrderActivationDocument =
      response.data.orderActivationDocument;
    const createdOrderBySiteActivationDocuments: OrderBySiteActivationDocument[] =
      response.data.orderBySiteActivationDocument;
    orderId2 = createdOrderActivationDocument.orderId;

    expect(response.status).equal(201);
    expect(createdOrderActivationDocument.nazaRegisteredResourceMrid[0]).equal(
      mockOrderActivationDocument2.nazaRegisteredResourceMrid[0]
    );
    expect(createdOrderActivationDocument.orderAllValue).equal(
      mockOrderActivationDocument2.orderAllValue
    );
    expect(createdOrderActivationDocument.createdDateTime).equal(
      mockOrderActivationDocument2.createdDateTime
    );
    expect(
      createdOrderActivationDocument.objectAggregationMeteringPoint[0]
    ).equal(mockOrderActivationDocument2.objectAggregationMeteringPoint[0]);
    expect(
      createdOrderActivationDocument.objectAggregationMeteringPoint[1]
    ).equal(mockOrderActivationDocument2.objectAggregationMeteringPoint[1]);
    expect(
      createdOrderActivationDocument.objectAggregationMeteringPoint[2]
    ).equal(mockOrderActivationDocument2.objectAggregationMeteringPoint[2]);

    // Check for orderBySiteActivationDocument
    expect(createdOrderBySiteActivationDocuments[0].orderId).equal(orderId2);
    expect(createdOrderBySiteActivationDocuments[0].orderValue).equal(
      mockOrderActivationDocument2.orderAllValue
    );
    expect(createdOrderBySiteActivationDocuments[0].logOrder.length).equal(2);
    expect(createdOrderBySiteActivationDocuments[0].logOrder[0].success).equal(
      true
    );
    expect(createdOrderBySiteActivationDocuments[0].logOrder[1].success).equal(
      true
    );

    expect(createdOrderBySiteActivationDocuments[1].orderId).equal(orderId2);
    expect(createdOrderBySiteActivationDocuments[1].orderValue).equal(
      mockOrderActivationDocument2.orderAllValue
    );
    expect(createdOrderBySiteActivationDocuments[1].logOrder.length).equal(2);
    expect(createdOrderBySiteActivationDocuments[1].logOrder[0].success).equal(
      true
    );
    expect(createdOrderBySiteActivationDocuments[1].logOrder[1].success).equal(
      true
    );
  });

  it('should not be able to get an OrderActivationDocument when the ID does not exist', async () => {
    try {
      await axios.get(`${Environment.baseUrlTSO}/api/order/NONEXISTINGID`, {
        headers: {'x-access-token': tokenTSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 404');
    }
  });

  it('should be able to get an OrderActivationDocument by ID as DSO1 when I have the permission', async () => {
    const queryResponse = await axios.get(
      `${Environment.baseUrlDSO}/api/orderActivationDocument/orderActivationDocumentId/${orderId1}`,
      {headers: {'x-access-token': tokenDSO1}}
    );
    expect(queryResponse.data.orderId).equal(orderId1);
  });

  it('should not be able to get an OrderActivationDocument by ID as BSP', async () => {
    try {
      await axios.get(
        `${Environment.baseUrlBSP}/api/orderActivationDocument/orderActivationDocumentId/${orderId1}`,
        {headers: {'x-access-token': tokenBSP1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
    }
  });

  it('should not be able to get an OrderActivationDocument by ID as PRODUCER', async () => {
    try {
      await axios.get(
        `${Environment.baseUrlPRODUCER}/api/orderActivationDocument/orderActivationDocumentId/${orderId1}`,
        {headers: {'x-access-token': tokenPRODUCER1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
    }
  });

  it('should not be able to get an OrderActivationDocument by ID as DSO1 when I do not have the permission', async () => {
    try {
      await axios.get(
        `${Environment.baseUrlDSO}/api/orderActivationDocument/orderActivationDocumentId/${orderId2}`,
        {headers: {'x-access-token': tokenDSO1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to get OrderActivationDocument.'
      );
    }
  });

  it('should be able to get all OrderActivationDocuments as DSO1 for which I have the permission', async () => {
    await axios.post(`${Environment.baseUrlTSO}/api/site/`, mockHVSiteDSO1, {
      headers: {'x-access-token': tokenTSO1}
    });
    await axios.post(
      `${Environment.baseUrlTSO}/api/orderActivationDocument/`,
      mockOrderActivationDocumentDSO1,
      {
        headers: {'x-access-token': tokenTSO1}
      }
    );
    await axios.post(`${Environment.baseUrlTSO}/api/site/`, mockHVSiteDSO2, {
      headers: {'x-access-token': tokenTSO1}
    });
    await axios.post(
      `${Environment.baseUrlTSO}/api/orderActivationDocument/`,
      mockOrderActivationDocumentDSO2,
      {
        headers: {'x-access-token': tokenTSO1}
      }
    );

    const queryResponse = await axios.get(
      `${Environment.baseUrlDSO}/api/orderActivationDocument/all`,
      {headers: {'x-access-token': tokenDSO1}}
    );
    expect(
      queryResponse.data.find(
        (orderActivationDocument) =>
          orderActivationDocument.a04RegisteredResourceMrid === 'DSO2'
      )
    ).to.be.undefined;
    expect(queryResponse.data.length).greaterThan(0);
  });

  it('should be able to query orderActivationDocuments as DSO1 for which I have the permission', async () => {
    mockHVSiteDSO1.nazaRegisteredResourceMrid = ['automateXXX'];
    mockHVSiteDSO1.objectAggregationMeteringPoint = 'siteXXX';
    await axios.post(`${Environment.baseUrlTSO}/api/site/`, mockHVSiteDSO1, {
      headers: {'x-access-token': tokenTSO1}
    });

    mockOrderActivationDocumentDSO1.nazaRegisteredResourceMrid = 'automateXXX';
    mockOrderActivationDocumentDSO1.objectAggregationMeteringPoint = ['siteXXX'];
    await axios.post(
      `${Environment.baseUrlTSO}/api/orderActivationDocument/`,
      mockOrderActivationDocumentDSO1,
      {
        headers: {'x-access-token': tokenTSO1}
      }
    );

    mockHVSiteDSO2.nazaRegisteredResourceMrid = ['automateXXX'];
    mockHVSiteDSO2.objectAggregationMeteringPoint = 'siteXXX';
    await axios.post(`${Environment.baseUrlTSO}/api/site/`, mockHVSiteDSO2, {
      headers: {'x-access-token': tokenTSO1}
    });

    mockOrderActivationDocumentDSO2.nazaRegisteredResourceMrid =
      'automateXXX';
    mockOrderActivationDocumentDSO2.objectAggregationMeteringPoint = [
      'siteXXX'
    ];
    await axios.post(
      `${Environment.baseUrlTSO}/api/orderActivationDocument/`,
      mockOrderActivationDocumentDSO2,
      {
        headers: {'x-access-token': tokenTSO1}
      }
    );

    const query = `?nazaRegisteredResourceMrid=automateXXX`;
    const queryResponse = await axios.get(
      `${Environment.baseUrlDSO}/api/orderActivationDocument/${query}`,
      {headers: {'x-access-token': tokenDSO1}}
    );

    expect(
      queryResponse.data.find(
        (orderActivationDocument) =>
          orderActivationDocument.a04RegisteredResourceMrid === 'DSO2'
      )
    ).to.be.undefined;
    expect(queryResponse.data.length).greaterThan(0);
  });

  it('should be able to get all available orderActivationDocuments as TSO1', async () => {
    const response = await axios.get(
      `${Environment.baseUrlTSO}/api/orderActivationDocument/all`,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const queryResponse: OrderActivationDocument[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).greaterThan(0);
  });

  it('should be able to get an orderActivationDocument with existing query parameters', async () => {
    const query = `?nazaRegisteredResourceMrid=${mockOrderActivationDocument2.nazaRegisteredResourceMrid}`;
    const response = await axios.get(
      `${Environment.baseUrlTSO}/api/orderActivationDocument${query}`,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const queryResponse: OrderActivationDocument[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse[0].objectAggregationMeteringPoint.toString()).equal(
      mockOrderActivationDocument2.objectAggregationMeteringPoint.toString()
    );
    expect(queryResponse[0].nazaRegisteredResourceMrid).equal(
      mockOrderActivationDocument2.nazaRegisteredResourceMrid
    );
    expect(queryResponse[0].orderAllValue).equal(
      mockOrderActivationDocument2.orderAllValue
    );
    expect(queryResponse[0].createdDateTime).equal(
      mockOrderActivationDocument2.createdDateTime
    );
  });

  it('should be able to get an orderActivationDocument with multiple query parameters', async () => {
    const createSiteResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/site/`,
      mockSiteForOrderActivationDocument2,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const createdSite: Site = createSiteResponse.data;
    siteId2 = createdSite.siteId;

    const query = `?orderId=${orderId2}&siteId=${siteId2}`;
    const response = await axios.get(
      `${Environment.baseUrlTSO}/api/order/orderBySiteActivationDocument/${query}`,
      {headers: {'x-access-token': tokenTSO1}}
    );

    expect(response.status).equal(200);
  });

  it('should not be able to get an orderActivationDocument with invalid query parameters', async () => {
    const query = '?nazaRegisteredResourceMrid=fjkdslafdjska';
    const response = await axios.get(
      `${Environment.baseUrlTSO}/api/orderActivationDocument${query}`,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const queryResponse: EDA[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).equal(0);
  });

  it('should be able to update an orderActivationDocument as TSO1', async () => {
    const updatedOrderActivationDocument: OrderActivationDocument = mockOrderActivationDocument;
    const updatedOrderAllValue = 1;
    updatedOrderActivationDocument.orderAllValue = updatedOrderAllValue;

    const response = await axios.put(
      `${Environment.baseUrlTSO}/api/orderActivationDocument/${orderId1}`,
      updatedOrderActivationDocument,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const createdOrder: OrderActivationDocument = response.data;

    expect(response.status).equal(200);
    expect(createdOrder.orderId).equal(orderId1);
    expect(createdOrder.orderAllValue).equal(updatedOrderAllValue);
  });

  it('should not be able to update an orderActivationDocument as DSO1', async () => {
    const updatedOrderActivationDocument: OrderActivationDocument = mockOrderActivationDocument;
    updatedOrderActivationDocument.orderAllValue = 0;

    try {
      await axios.put(
        `${Environment.baseUrlDSO}/api/orderActivationDocument/${orderId1}`,
        updatedOrderActivationDocument,
        {headers: {'x-access-token': tokenDSO1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to update an OrderActivationDocument.'
      );
    }
  });

  it('should not be able to update an orderActivationDocument as BSP', async () => {
    const updatedOrderActivationDocument: OrderActivationDocument = mockOrderActivationDocument;
    updatedOrderActivationDocument.orderAllValue = 0;

    try {
      await axios.put(
        `${Environment.baseUrlBSP}/api/orderActivationDocument/${orderId1}`,
        updatedOrderActivationDocument,
        {headers: {'x-access-token': tokenBSP1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
    }
  });

  it('should not be able to update an orderActivationDocument as PRODUCER', async () => {
    const updatedOrderActivationDocument: OrderActivationDocument = mockOrderActivationDocument;
    updatedOrderActivationDocument.orderAllValue = 0;

    try {
      await axios.put(
        `${Environment.baseUrlPRODUCER}/api/orderActivationDocument/${orderId1}`,
        updatedOrderActivationDocument,
        {headers: {'x-access-token': tokenPRODUCER1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
    }
  });
});
