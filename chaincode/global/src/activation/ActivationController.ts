/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeStub} from 'fabric-shim';
import {Log} from '../../logger/Log';
import {IController} from '../../interfaces/IController';
import {Activation} from './Activation';
import {LogOrder} from '../logOrder/LogOrder';
import {OrderBySiteActivationDocument} from '../orderBySiteActivationDocument/OrderBySiteActivationDocument';
import {SiteController} from '../site/SiteController';
import {EDAController} from '../eda/EDAController';
import {EDPController} from '../edp/EDPController';
import {BidController} from '../bid/BidController';
import {Site} from '../site/Site';
import {EDA} from '../eda/EDA';
import {EDP} from '../edp/EDP';
import {Bid} from '../bid/Bid';
import {LogOrderType} from '../logOrder/enums/LogOrderType.enum';
import {PowerPlanEnergyScheduleController} from '../powerPlanEnergySchedule/PowerPlanEnergyScheduleController';
import {PowerPlanEnergySchedule} from '../powerPlanEnergySchedule/PowerPlanEnergySchedule';
import {Point} from '../point/Point';
import {MVController} from '../MV/MVController';
import {HVController} from '../HV/HVController';
import {MV} from '../MV/MV';
import {HV} from '../HV/HV';
import {OrderBySiteActivationDocumentController} from '../orderBySiteActivationDocument/OrderBySiteActivationDocumentController';
import {IOrganization} from '../../interfaces/IOrganization';
import {OrganizationTypeMsp} from '../../enums/OrganizationTypeMsp';

export class ActivationController implements IController {
  public RANGE_POINT_SELECTION_ADJUSTMENT_ONE_HOUR = 3600;
  private orderBySiteController: OrderBySiteActivationDocumentController;
  private siteController: SiteController;
  private edaController: EDAController;
  private edpController: EDPController;
  private bidController: BidController;
  private powerPlanEnergyScheduleController: PowerPlanEnergyScheduleController;
  private mvController: MVController;
  private hvController: HVController;
  private organizationType: string;

  public constructor(private stub: ChaincodeStub) {
    this.orderBySiteController = new OrderBySiteActivationDocumentController(
      stub
    );
    this.siteController = new SiteController(stub);
    this.edaController = new EDAController(stub);
    this.edpController = new EDPController(stub);
    this.bidController = new BidController(stub);
    this.powerPlanEnergyScheduleController = new PowerPlanEnergyScheduleController(
      stub
    );
    this.mvController = new MVController(stub);
    this.hvController = new HVController(stub);
    this.organizationType = this.stub.getCreator().getMspid();
  }

  public async getActivations(
    organization: IOrganization
  ): Promise<Activation[]> {
    Log.chaincode.debug('====== Create Activations ======');

    let activations: Activation[] = [];

    const orderBySites: OrderBySiteActivationDocument[] = await this.orderBySiteController.getAllOrderBySiteActivationDocuments(
      organization
    );

    for (const orderBySite of orderBySites) {
      const logOrderStart: LogOrder = this.findLogOrderByType(
        orderBySite.logOrder,
        LogOrderType.RECEPTION
      );
      const logOrderStartTimestamp: string = logOrderStart.logOrderTimestamp;

      const logOrderEnd: LogOrder = this.findLogOrderByType(
        orderBySite.logOrder,
        LogOrderType.END
      );
      let logOrderEndTimestamp: string;
      if (logOrderEnd) {
        logOrderEndTimestamp = logOrderEnd.logOrderTimestamp;
      } else {
        logOrderEndTimestamp = '';
      }

      const activation: Activation = await this.constructActivation(
        orderBySite,
        logOrderStartTimestamp,
        logOrderEndTimestamp,
        organization
      );
      activations.push(activation);
    }

    return activations;
  }

  private async constructActivation(
    orderBySite: OrderBySiteActivationDocument,
    logOrderStartTimestamp: string,
    logOrderEndTimestamp: string,
    organization: IOrganization
  ): Promise<Activation> {
    let site: Site;
    let objectAggregationMeteringPoint = '-';
    let type = '-';
    let a46Name = '-';
    let edaRegisteredResourceMrid = '-';
    let bidRegisteredResourceMrid = '-';
    let powerPlanEnergyScheduleIds: string[] = [];
    let dataPowerPlanEnergySchedule: Point[] = [];
    let timeSeries: Point[] = [];

    site = await this.getAssetById(orderBySite.siteId);
    if (site) {
      objectAggregationMeteringPoint = site.objectAggregationMeteringPoint;
      type = site.voltageType;

      const eda: EDA = await this.getAssetById(site.edaRegisteredResourceId);

      if (eda) {
        a46Name = eda.a46Name;
        edaRegisteredResourceMrid = eda.edaRegisteredResourceMrid;
      }

      const edp: EDP[] = await this.edpController.queryEDP(
        JSON.stringify({siteId: site.siteId}),
        organization
      );
      timeSeries = await this.getHTPoint(
        site.siteId,
        logOrderStartTimestamp,
        logOrderEndTimestamp,
        site.voltageType,
        organization
      );

      if (timeSeries.length > 0) {
        timeSeries.sort((point1: Point, point2: Point): number => {
          return Number(point1.timeStampStart) - Number(point2.timeStampStart);
        });

        if (eda) {
          const bids: Bid[] = await this.bidController.queryBid(
            JSON.stringify({
              edaRegisteredResourceId: eda.edaRegisteredResourceId
            }),
            organization
          );

          if (bids.length) {
            const bid: Bid | undefined = bids.find(
              (bidInArray) =>
                bidInArray.timeIntervalStart >= timeSeries[0].timeStampStart &&
                bidInArray.timeIntervalEnd <=
                  timeSeries[timeSeries.length - 1].timeStampEnd
            );

            if (bid) {
              bidRegisteredResourceMrid = bid.bidRegisteredResourceMrid;
            }
          }
        }
      }

      if (edp.length > 0) {
        const powerPlanEnergySchedules: PowerPlanEnergySchedule[] = await this.powerPlanEnergyScheduleController.queryPowerPlanEnergySchedule(
          JSON.stringify({
            edpRegisteredResourceId: edp[0].edpRegisteredResourceId,
            logOrderStartTimestamp,
            logOrderEndTimestamp
          }),
          organization
        );

        const filteredPowerPlanEnergySchedule:
          | PowerPlanEnergySchedule[]
          | undefined = powerPlanEnergySchedules.filter(
          (powerPlanEnergyScheduleInArray) =>
            this.filterPowerPlanEnergySchedule(
              powerPlanEnergyScheduleInArray,
              logOrderStartTimestamp,
              logOrderEndTimestamp
            )
        );

        if (filteredPowerPlanEnergySchedule.length) {
          filteredPowerPlanEnergySchedule.forEach((powerPlanEnergySchedule) => {
            powerPlanEnergyScheduleIds.push(
              powerPlanEnergySchedule.powerPlanEnergyScheduleId
            );

            dataPowerPlanEnergySchedule = dataPowerPlanEnergySchedule.concat(
              powerPlanEnergySchedule.timeSeries
            );
          });

          if (dataPowerPlanEnergySchedule.length > 0) {
            dataPowerPlanEnergySchedule.sort(
              (point1: Point, point2: Point): number => {
                return (
                  Number(point1.timeStampStart) - Number(point2.timeStampStart)
                );
              }
            );
          }
        }
      }
    }

    if (timeSeries.length > 0) {
      timeSeries =
        timeSeries.filter((point: Point) =>
          this.filterArrayPoint(
            point,
            logOrderStartTimestamp,
            logOrderEndTimestamp
          )
        ) || null;

      this.setIdPoints(timeSeries);
    }

    if (dataPowerPlanEnergySchedule.length > 0) {
      dataPowerPlanEnergySchedule =
        dataPowerPlanEnergySchedule.filter((point: Point) =>
          this.filterArrayPoint(
            point,
            logOrderStartTimestamp,
            logOrderEndTimestamp
          )
        ) || null;

      this.setIdPoints(dataPowerPlanEnergySchedule);
    }

    return new Activation(
      a46Name,
      edaRegisteredResourceMrid,
      objectAggregationMeteringPoint,
      type,
      bidRegisteredResourceMrid,
      this.createDateInShortFormat(orderBySite.createdDateTime),
      this.organizationType !== OrganizationTypeMsp.PRODUCER
        ? orderBySite.orderId
        : undefined,
      this.organizationType !== OrganizationTypeMsp.PRODUCER
        ? orderBySite.orderValue
        : undefined,
      orderBySite.idOrderBySite,
      orderBySite.orderValue,
      this.createTimestampInShortFormat(
        orderBySite.createdDateTime,
        orderBySite.timeZone
      ),
      powerPlanEnergyScheduleIds,
      dataPowerPlanEnergySchedule,
      timeSeries,
      orderBySite.logOrder
    );
  }

  private setIdPoints(pointArray: Point[]): void {
    for (const [index, point] of pointArray.entries()) {
      point.idPoint = `${index + 1}`;
    }
  }

  private async getAssetById(id: string): Promise<any> {
    const resultAsBytes: Buffer = await this.stub.getState(id);

    if (!resultAsBytes || !resultAsBytes.toString()) {
      return undefined;
    }

    return JSON.parse(resultAsBytes.toString());
  }

  private findLogOrderByType(logOrders: LogOrder[], type: string): any {
    return logOrders.find((logOrder: LogOrder) => logOrder.type === type);
  }

  private async getHTPoint(
    siteId: string,
    logOrderStartTimestamp: string,
    logOrderEndTimestamp: string,
    typeMVSite: string,
    organization: IOrganization
  ): Promise<Point[]> {
    let result: Point[] = [];

    if (typeMVSite === 'MV') {
      const mvs: MV[] = await this.mvController.queryMV(
        JSON.stringify({
          siteId,
          logOrderStartTimestamp,
          logOrderEndTimestamp
        }),
        organization
      );

      if (mvs.length) {
        const filteredMVs: MV[] | undefined = mvs.filter((mvInArray) =>
          this.filterHT(mvInArray, logOrderStartTimestamp, logOrderEndTimestamp)
        );

        if (filteredMVs.length) {
          filteredMVs.forEach((mv) => {
            result = result.concat(mv.timeSeries);
          });
        }
      }
    } else {
      const hvs: HV[] = await this.hvController.queryHV(
        JSON.stringify({
          siteId,
          logOrderStartTimestamp,
          logOrderEndTimestamp
        }),
        organization
      );

      if (hvs.length) {
        const filteredHVs: HV[] | undefined = hvs.filter((hvInArray) =>
          this.filterHT(hvInArray, logOrderStartTimestamp, logOrderEndTimestamp)
        );

        if (filteredHVs.length) {
          filteredHVs.forEach((hv) => {
            result = result.concat(hv.timeSeries);
          });
        }
      }
    }

    return result;
  }

  private filterHT(
    ht: any,
    logOrderStartTimestamp: string,
    logOrderEndTimestamp: string
  ): boolean {
    if (ht.timeSeries) {
      return !!ht.timeSeries.find(
        (arrayPoint: Point) =>
          arrayPoint.timeStampStart >= logOrderStartTimestamp &&
          arrayPoint.timeStampEnd <= logOrderEndTimestamp
      );
    }

    if (ht.timeSeries) {
      return !!ht.timeSeries.find(
        (arrayPoint: Point) =>
          arrayPoint.timeStampStart >= logOrderStartTimestamp &&
          arrayPoint.timeStampEnd <= logOrderEndTimestamp
      );
    }

    return false;
  }

  private filterPowerPlanEnergySchedule(
    powerPlanEnergySchedule: PowerPlanEnergySchedule,
    startTimeStamp: string,
    endTimeStamp: string
  ): boolean {
    if (powerPlanEnergySchedule.timeSeries) {
      return !!powerPlanEnergySchedule.timeSeries.find(
        (arrayPoint: Point) =>
          arrayPoint.timeStampStart >= startTimeStamp &&
          arrayPoint.timeStampEnd <= endTimeStamp
      );
    }

    return false;
  }

  private createTimestampInShortFormat(date: string, timezone: string): string {
    if (date) {
      return new Date(Number(date) * 1000).toLocaleTimeString(timezone, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }

    return '';
  }

  private createDateInShortFormat(date: string): string {
    if (!date) {
      return '';
    }

    return new Date(Number(date) * 1000).toLocaleDateString('en-GB');
  }

  private filterArrayPoint(
    point: Point,
    timestampOrderStart: string,
    timestampOrderEnd: string
  ): boolean {
    return (
      Number(point.timeStampStart) >=
        Number(timestampOrderStart) -
          this.RANGE_POINT_SELECTION_ADJUSTMENT_ONE_HOUR &&
      Number(point.timeStampEnd) <=
        Number(timestampOrderEnd) +
          this.RANGE_POINT_SELECTION_ADJUSTMENT_ONE_HOUR
    );
  }
}
