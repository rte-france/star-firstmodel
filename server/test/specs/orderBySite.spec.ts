/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import axios from 'axios';
import {expect} from 'chai';
import {TimeoutDuration} from '../enums/timeoutDuration.enum';
import {loginHelper} from '../helpers/Login.helper';
import {Environment} from '../../config/Environment';
import {OrderBySiteActivationDocument} from '../../src/models/OrderBySiteActivationDocument';
import {Site} from '../../src/models/Site';
import {SiteHelper} from '../helpers/Site.helper';
import {SiteType} from '../enums/SiteType';
import {OrderBySiteActivationDocumentHelper} from '../helpers/OrderBySiteActivationDocument.helper';
import {EDA} from '../../src/models/EDA';
import {EDAHelper} from '../helpers/EDA.helper';

let tokenTSO1: string;
let tokenDSO1: string;
let tokenBSP1: string;
let tokenPRODUCER1: string;
let orderBySiteId: string;
let grdOrderBySiteId: string;
let siteId: string;

const mockEDA: EDA = new EDAHelper().createEda('BSP1', '7Y778300000I');
const mockEDA2: EDA = new EDAHelper().createEda('BSP2', '7Y778300000I');
const mockMVSite: Site = new SiteHelper().createSite(
  ['automate1'],
  'DSO1',
  SiteType.MV,
  'PRM00000000234766',
  'EolienAlize'
);
const mockSiteHV: Site = new SiteHelper().createSite(
  ['automate1'],
  'DSO2',
  SiteType.HV,
  'PRM00000000234766',
  'EolienMistral'
);
const mockOrderBySiteActivationDocument: OrderBySiteActivationDocument = new OrderBySiteActivationDocumentHelper().createOrderBySiteActivationDocument();

describe('OrderBySiteActivationDocument REST test', () => {
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

  it('should be able to create an OrderBySiteActivationDocument as TSO1', async () => {
    const createEDAResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/eda/`,
      mockEDA,
      {headers: {'x-access-token': tokenTSO1}}
    );
    mockSiteHV.edaRegisteredResourceId =
      createEDAResponse.data.edaRegisteredResourceId;
    const createSiteResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/site/`,
      mockSiteHV,
      {headers: {'x-access-token': tokenTSO1}}
    );
    mockOrderBySiteActivationDocument.siteId = createSiteResponse.data.siteId;
    const response = await axios.post(
      `${Environment.baseUrlTSO}/api/order/orderBySiteActivationDocument/`,
      [mockOrderBySiteActivationDocument],
      {headers: {'x-access-token': tokenTSO1}}
    );
    const createdOrderBySiteActivationDocuments: OrderBySiteActivationDocument[] =
      response.data;
    orderBySiteId = createdOrderBySiteActivationDocuments[0].idOrderBySite;

    expect(response.status).equal(201);
    expect(createdOrderBySiteActivationDocuments[0].siteId).equal(
      mockOrderBySiteActivationDocument.siteId
    );
    expect(createdOrderBySiteActivationDocuments[0].orderId).equal(
      mockOrderBySiteActivationDocument.orderId
    );
    expect(createdOrderBySiteActivationDocuments[0].orderValue).equal(
      mockOrderBySiteActivationDocument.orderValue
    );
    expect(createdOrderBySiteActivationDocuments[0].createdDateTime).equal(
      mockOrderBySiteActivationDocument.createdDateTime
    );
    expect(createdOrderBySiteActivationDocuments[0].timeZone).equal(
      mockOrderBySiteActivationDocument.timeZone
    );
  });

  it('should be able to create an OrderBySiteActivationDocument as DSO1 when the organization has the permission.', async () => {
    const createEDAResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/eda/`,
      mockEDA2,
      {headers: {'x-access-token': tokenTSO1}}
    );
    mockMVSite.edaRegisteredResourceId =
      createEDAResponse.data.edaRegisteredResourceId;
    const createSiteResponse = await axios.post(
      `${Environment.baseUrlDSO}/api/site/`,
      mockMVSite,
      {headers: {'x-access-token': tokenDSO1}}
    );
    siteId = createSiteResponse.data.siteId;

    const orderBySiteActivationDocument: OrderBySiteActivationDocument = mockOrderBySiteActivationDocument;
    orderBySiteActivationDocument.siteId = siteId;

    const response = await axios.post(
      `${Environment.baseUrlDSO}/api/order/orderBySiteActivationDocument/`,
      [orderBySiteActivationDocument],
      {headers: {'x-access-token': tokenDSO1}}
    );
    const createdOrderBySiteActivationDocument: OrderBySiteActivationDocument[] =
      response.data;
    grdOrderBySiteId = createdOrderBySiteActivationDocument[0].idOrderBySite;

    expect(response.status).equal(201);
    expect(createdOrderBySiteActivationDocument[0].siteId).equal(
      mockOrderBySiteActivationDocument.siteId
    );
    expect(createdOrderBySiteActivationDocument[0].orderId).equal(
      mockOrderBySiteActivationDocument.orderId
    );
    expect(createdOrderBySiteActivationDocument[0].orderValue).equal(
      mockOrderBySiteActivationDocument.orderValue
    );
    expect(createdOrderBySiteActivationDocument[0].createdDateTime).equal(
      mockOrderBySiteActivationDocument.createdDateTime
    );
    expect(createdOrderBySiteActivationDocument[0].timeZone).equal(
      mockOrderBySiteActivationDocument.timeZone
    );
  });

  it('should not be able to create an OrderBySiteActivationDocument as BSP', async () => {
    try {
      await axios.post(
        `${Environment.baseUrlBSP}/api/order/orderBySiteActivationDocument/`,
        [mockOrderBySiteActivationDocument],
        {headers: {'x-access-token': tokenBSP1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create orderBySiteActivationDocuments.'
      );
    }
  });

  it('should not be able to create an OrderBySiteActivationDocument as PRODUCER', async () => {
    try {
      await axios.post(
        `${Environment.baseUrlPRODUCER}/api/order/orderBySiteActivationDocument/`,
        [mockOrderBySiteActivationDocument],
        {headers: {'x-access-token': tokenPRODUCER1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create orderBySiteActivationDocuments.'
      );
    }
  });

  it('should be able to get an OrderBySiteActivationDocument by id as DSO1 when the organization has the permission.', async () => {
    const response = await axios.get(
      `${Environment.baseUrlDSO}/api/order/orderBySiteActivationDocument/orderBySiteActivationDocumentId/${grdOrderBySiteId}`,
      {headers: {'x-access-token': tokenDSO1}}
    );

    expect(response.status).equal(200);
    expect(response.data.idOrderBySite).equal(grdOrderBySiteId);
  });

  it('should not be able to get an OrderBySiteActivationDocument by id as DSO1 when the organization does not have the permission.', async () => {
    try {
      await axios.get(
        `${Environment.baseUrlDSO}/api/order/orderBySiteActivationDocument/orderBySiteActivationDocumentId/${orderBySiteId}`,
        {headers: {'x-access-token': tokenDSO1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        `Organization is not allowed to get ${orderBySiteId}`
      );
    }
  });

  it('should be able to get an OrderBySiteActivationDocument by id as BSP when the organization has permission.', async () => {
    const response = await axios.get(
      `${Environment.baseUrlBSP}/api/order/orderBySiteActivationDocument/orderBySiteActivationDocumentId/${orderBySiteId}`,
      {headers: {'x-access-token': tokenBSP1}}
    );

    expect(response.status).equal(200);
    expect(response.data.idOrderBySite).equal(orderBySiteId);
  });

  it('should be able to get an OrderBySiteActivationDocument by id as PRODUCER when the organization has permission.', async () => {
    const response = await axios.get(
      `${Environment.baseUrlPRODUCER}/api/order/orderBySiteActivationDocument/orderBySiteActivationDocumentId/${orderBySiteId}`,
      {headers: {'x-access-token': tokenPRODUCER1}}
    );

    expect(response.status).equal(200);
    expect(response.data.idOrderBySite).equal(orderBySiteId);
  });

  it('should not be able to get an OrderBySiteActivationDocument by id as BSP when the organization does not have the permission.', async () => {
    try {
      await axios.get(
        `${Environment.baseUrlBSP}/api/order/orderBySiteActivationDocument/orderBySiteActivationDocumentId/${grdOrderBySiteId}`,
        {headers: {'x-access-token': tokenBSP1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        `Organization is not allowed to get ${grdOrderBySiteId}`
      );
    }
  });

  it('should not be able to get an OrderBySiteActivationDocument by id as PRODUCER when the organization does not have the permission.', async () => {
    try {
      await axios.get(
        `${Environment.baseUrlPRODUCER}/api/order/orderBySiteActivationDocument/orderBySiteActivationDocumentId/${grdOrderBySiteId}`,
        {headers: {'x-access-token': tokenPRODUCER1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        `Organization is not allowed to get ${grdOrderBySiteId}`
      );
    }
  });

  it('should be able to get all OrderBySiteActivationDocument as DSO1 for which the organization has the permission.', async () => {
    const queryResponse = await axios.get(
      `${Environment.baseUrlDSO}/api/order/orderBySiteActivationDocument/all`,
      {headers: {'x-access-token': tokenDSO1}}
    );

    expect(queryResponse.status).equal(200);
    expect(
      queryResponse.data.find(
        (orderBySite) => orderBySite.idOrderBySite === grdOrderBySiteId
      )
    ).to.not.be.undefined;
    expect(
      queryResponse.data.find(
        (orderBySite) => orderBySite.idOrderBySite === orderBySiteId
      )
    ).to.be.undefined;
  });

  it('should be able to get all OrderBySiteActivationDocuments as BSP for which the organization has the permission.', async () => {
    const queryResponse = await axios.get(
      `${Environment.baseUrlBSP}/api/order/orderBySiteActivationDocument/all`,
      {headers: {'x-access-token': tokenBSP1}}
    );

    expect(queryResponse.status).equal(200);
    expect(
      queryResponse.data.find(
        (orderBySite) => orderBySite.idOrderBySite === orderBySiteId
      )
    ).to.not.be.undefined;
    expect(
      queryResponse.data.find(
        (orderBySite) => orderBySite.idOrderBySite === grdOrderBySiteId
      )
    ).to.be.undefined;
  });

  it('should be able to get all OrderBySiteActivationDocuments as PRODUCER for which the organization has the permission.', async () => {
    const queryResponse = await axios.get(
      `${Environment.baseUrlPRODUCER}/api/order/orderBySiteActivationDocument/all`,
      {headers: {'x-access-token': tokenPRODUCER1}}
    );

    expect(queryResponse.status).equal(200);
    expect(
      queryResponse.data.find(
        (orderBySite) => orderBySite.idOrderBySite === orderBySiteId
      )
    ).to.not.be.undefined;
    expect(
      queryResponse.data.find(
        (orderBySite) => orderBySite.idOrderBySite === grdOrderBySiteId
      )
    ).to.be.undefined;
  });

  it('should be able to query OrderBySiteActivationDocuments as DSO1 for which the organization has the permission.', async () => {
    const query = `?nazaRegisteredResourceMrid=${mockMVSite.nazaRegisteredResourceMrid}`;
    const queryResponse = await axios.get(
      `${Environment.baseUrlDSO}/api/order/orderBySiteActivationDocument/${query}`,
      {headers: {'x-access-token': tokenDSO1}}
    );

    expect(queryResponse.status).equal(200);
    expect(
      queryResponse.data.find(
        (orderBySite) => orderBySite.idOrderBySite === grdOrderBySiteId
      )
    ).to.not.be.undefined;
    expect(
      queryResponse.data.find(
        (orderBySite) => orderBySite.idOrderBySite === orderBySiteId
      )
    ).to.be.undefined;
  });

  it('should be able to query OrderBySiteActivationDocuments as BSP for which the organization has the permission.', async () => {
    const query = `?nazaRegisteredResourceMrid=${mockMVSite.nazaRegisteredResourceMrid}`;
    const queryResponse = await axios.get(
      `${Environment.baseUrlBSP}/api/order/orderBySiteActivationDocument/${query}`,
      {headers: {'x-access-token': tokenBSP1}}
    );

    expect(queryResponse.status).equal(200);
    expect(
      queryResponse.data.find(
        (orderBySiteActivationDocument) =>
          orderBySiteActivationDocument.idOrderBySite === orderBySiteId
      )
    ).to.not.be.undefined;
    expect(
      queryResponse.data.find(
        (orderBySiteActivationDocument) =>
          orderBySiteActivationDocument.idOrderBySite === grdOrderBySiteId
      )
    ).to.be.undefined;
  });

  it('should be able to query OrderBySiteActivationDocuments as PRODUCER for which the organization has the permission.', async () => {
    const query = `?nazaRegisteredResourceMrid=${mockMVSite.nazaRegisteredResourceMrid}`;
    const queryResponse = await axios.get(
      `${Environment.baseUrlPRODUCER}/api/order/orderBySiteActivationDocument/${query}`,
      {headers: {'x-access-token': tokenPRODUCER1}}
    );

    expect(queryResponse.status).equal(200);
    expect(
      queryResponse.data.find(
        (orderBySite) => orderBySite.idOrderBySite === orderBySiteId
      )
    ).to.not.be.undefined;
    expect(
      queryResponse.data.find(
        (orderBySite) => orderBySite.idOrderBySite === grdOrderBySiteId
      )
    ).to.be.undefined;
  });

  it('should not be able to update an OrderBySiteActivationDocument as BSP when organization does not have permission', async () => {
    const updatedOrderBySiteActivationDocument: OrderBySiteActivationDocument = mockOrderBySiteActivationDocument;
    updatedOrderBySiteActivationDocument.orderValue = 1;
    updatedOrderBySiteActivationDocument.siteId = siteId;

    try {
      await axios.put(
        `${Environment.baseUrlBSP}/api/order/orderBySiteActivationDocument/updateOrderBySiteActivationDocumentById/${orderBySiteId}`,
        updatedOrderBySiteActivationDocument,
        {headers: {'x-access-token': tokenBSP1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        `Organization does not have the permission to update`
      );
    }
  });

  it('should not be able to update an OrderBySiteActivationDocument as PRODUCER when organization does not have permission', async () => {
    const updatedOrderBySiteActivationDocument: OrderBySiteActivationDocument = mockOrderBySiteActivationDocument;
    updatedOrderBySiteActivationDocument.orderValue = 1;
    updatedOrderBySiteActivationDocument.siteId = siteId;

    try {
      await axios.put(
        `${Environment.baseUrlPRODUCER}/api/order/orderBySiteActivationDocument/updateOrderBySiteActivationDocumentById/${orderBySiteId}`,
        updatedOrderBySiteActivationDocument,
        {headers: {'x-access-token': tokenPRODUCER1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        `Organization does not have the permission to update`
      );
    }
  });

  it('should be able to update an OrderBySiteActivationDocument as DSO1 for which the organization has the permission.', async () => {
    const updatedOrderBySiteActivationDocument: OrderBySiteActivationDocument = mockOrderBySiteActivationDocument;
    updatedOrderBySiteActivationDocument.idOrderBySite = grdOrderBySiteId;
    updatedOrderBySiteActivationDocument.orderValue = 1;

    const invokeResponse = await axios.put(
      `${Environment.baseUrlDSO}/api/order/orderBySiteActivationDocument/updateOrderBySiteActivationDocumentById/${grdOrderBySiteId}`,
      updatedOrderBySiteActivationDocument,
      {headers: {'x-access-token': tokenDSO1}}
    );

    expect(invokeResponse.status).equal(200);
    expect(invokeResponse.data.payload.idOrderBySite).equal(grdOrderBySiteId);
  });

  it('should not be able to update an OrderBySiteActivationDocument as DSO1 for which the organization does not have the permission.', async () => {
    const updatedOrderBySiteActivationDocument: OrderBySiteActivationDocument = mockOrderBySiteActivationDocument;
    updatedOrderBySiteActivationDocument.idOrderBySite = orderBySiteId;
    updatedOrderBySiteActivationDocument.orderValue = 1;
    updatedOrderBySiteActivationDocument.siteId = siteId;

    try {
      await axios.put(
        `${Environment.baseUrlDSO}/api/order/orderBySiteActivationDocument/updateOrderBySiteActivationDocumentById/${orderBySiteId}`,
        updatedOrderBySiteActivationDocument,
        {headers: {'x-access-token': tokenDSO1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        `OrganizationType is not allowed to update orderBySiteActivationDocument.`
      );
    }
  });
});
