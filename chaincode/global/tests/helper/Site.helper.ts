/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Site} from '../../src/site/Site';
import {SiteType} from '../../src/site/enums/SiteType';
import {producerOrganization} from './Organization.helper';

export class SiteHelper {
  public createSite(
    siteId: string,
    type: SiteType,
    edaRegisteredResourceId: string,
    a04RegisteredResourceMrid: string,
    producerIEC: string = producerOrganization.organizationId
  ): Site {
    return new Site(
      siteId,
      edaRegisteredResourceId,
      ['nazaRegisteredResourceMrid'],
      a04RegisteredResourceMrid,
      type,
      'codeSite',
      'siteName',
      'siteSIRET',
      'productionL',
      'DSO',
      'siteType',
      'siteIEC',
      'producer',
      producerIEC
    );
  }
}
