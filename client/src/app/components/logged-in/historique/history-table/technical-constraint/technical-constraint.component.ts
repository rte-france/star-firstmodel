/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Component, Input} from '@angular/core';
import {Activation} from '../../../../../models/activation';
import {LogOrder} from '../../../../../models/LogOrder';
import {LogOrderType} from '../../../../../enums/LogOrderType';
import {OrderService} from '../../../../../services/order/OrderService';
import {Organization} from '../../../../common/Organization';

@Component({
  selector: 'app-technical-constraint',
  templateUrl: './technical-constraint.component.html',
  styleUrls: ['./technical-constraint.component.scss']
})
export class TechnicalConstraintComponent {
  @Input()
  public selectedActivation: Activation;

  @Input()
  public activations: Activation[];

  @Input()
  public company: string;

  public technicalConstraintIsSubmittedSuccessfully: boolean;

  public constructor(private _orderService: OrderService) {}

  public submitTechnicalConstraint(
    technicalConstraintMessage: string,
    orderBySiteId: string
  ): void {
    const logOrder = new LogOrder(
      '',
      technicalConstraintMessage,
      LogOrderType.ACTIVATION,
      false,
      new Date().getTime().toString()
    );

    this._orderService
      .reportTechnicalConstraint(logOrder, orderBySiteId)
      .subscribe(() => {
        for (const activation of this.activations) {
          if (activation.siteOrderId === orderBySiteId) {
            this._orderService
              .getOrderBySiteActivationDocumentById(orderBySiteId)
              .subscribe((result) => {
                activation.logOrder = result.logOrder;
              });

            this.technicalConstraintIsSubmittedSuccessfully = true;
          }
        }
      });
  }

  public displayCreatorOfConstraint(): string {
    const logOrder:
      | LogOrder
      | undefined = this.selectedActivation.logOrder.find(
      (logOrderInActivation: LogOrder) =>
        logOrderInActivation.type === 'activation'
    );

    return logOrder ? logOrder.creator : '';
  }

  public isUserAllowedToReportTechnicalConstraint(): boolean {
    return (
      Organization.isBSPType(this.company) ||
      Organization.isProducerType(this.company)
    );
  }

  public isTooltipOpen(selectedActivation: any): boolean {
    if (
      Organization.isBSPType(this.company) &&
      this.isTechnicalConstraintReported(selectedActivation)
    ) {
      return true;
    } else if (Organization.isBSPType(this.company)) {
      return true;
    } else if (
      Organization.isProducerType(this.company) &&
      this.isTechnicalConstraintReported(selectedActivation)
    ) {
      return true;
    } else if (Organization.isProducerType(this.company)) {
      return true;
    }

    return false;
  }

  public setToolTipMessage(logOrders: LogOrder[]): string {
    for (const logOrder of logOrders) {
      if (logOrder.type === LogOrderType.ACTIVATION && !logOrder.success) {
        return logOrder.message;
      }
    }
  }

  public setToolTipTime(logOrders: LogOrder[]): string {
    for (const logOrder of logOrders) {
      if (logOrder.type === LogOrderType.ACTIVATION && !logOrder.success) {
        const date: Date = new Date(Number(logOrder.logOrderTimestamp));

        return `${date.getHours().toString()}:${date.getMinutes().toString()}`;
      }
    }
  }

  public isTechnicalConstraintReported(logOrders: LogOrder[]): boolean {
    for (const logOrder of logOrders) {
      if (logOrder.type === LogOrderType.ACTIVATION && !logOrder.success) {
        return !logOrder.success;
      }
    }
  }
}
