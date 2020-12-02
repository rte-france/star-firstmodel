/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


export enum FabricError {
  INIT_FAILURE = 'Failed to instantiate HLF Client',
  EVENTHUB_CONNECTION_FAILURE = 'Connection to channel event hub failed: ',
  EVENTHUB_CONNECTION_TIMEOUT = 'Connection to channel event hub timeout',
  USER_ENROLLMENT_FAILURE = 'Failed to enroll user: %s',
  INVALID_CHANNEL = 'Invalid channel: ',
  TRANSACTION_PROPOSAL_FAILURE = 'Transaction proposal failed',
  TRANSACTION_REGISTERING_TIMEOUT = 'Transaction registering timeout',
  TRANSACTION_BROADCAST_FAILURE = 'Transaction broadcast failed',
  TRANSACTION_PROCESSING_FAILURE = 'Transaction processing failed',
  QUERY_FAILURE = 'Chaincode query failed: '
}

