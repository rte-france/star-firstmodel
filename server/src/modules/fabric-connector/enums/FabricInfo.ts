/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


export enum FabricInfo {
  INIT_FABRIC = 'Initializing Fabric Connector...',
  CONNECTION_PROFILE_SUCCESS = 'Successfully loaded connection profile: %s',
  INIT_FABRIC_CLIENT_SUCCESS = 'Successfully instantiated Fabric Client',
  INIT_FABRIC_CA_SERVICES_SUCCESS = 'Successfully instantiated Fabric CA Services',
  USER_CONTEXT_SET = 'User context set to: %s',
  USER_ENROLLED = 'User is enrolled: %s',
  CONNECTED_EVENT_HUBS = 'Connected to channel event hubs',
  INIT_FABRIC_SUCCESS = 'Successfully initialized Fabric Connector',
  READY = 'Server is ready...',
  SEND_TRANSACTION_PROPOSAL = 'Creating and sending transaction proposal [chaincode function: %s]',
  CHECK_TRANSACTION_PROPOSAL = 'Checking if transaction proposal is good...',
  TRANSACTION_PROPOSAL_CHECKED = 'Transaction proposal is good',
  PROCESSING_TRANSACTION = 'Processing transaction...',
  TRANSACTION_PROCESSED = 'Transaction processed',
  QUERY_CHAINCODE = 'Creating and sending chaincode query [chaincode function: %s]'
}

