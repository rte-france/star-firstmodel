/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/



import {Injectable} from '@nestjs/common';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as Client from 'fabric-client';
import {
  BroadcastResponse,
  ChaincodeInvokeRequest,
  ChaincodeQueryRequest,
  Channel,
  ChannelEventHub,
  ICryptoKeyStore,
  ICryptoSuite,
  IKeyValueStore,
  Orderer,
  Peer,
  ProposalResponse,
  ProposalResponseObject,
  TransactionId,
  User
} from 'fabric-client';
import * as FabricCAServices from 'fabric-ca-client';
import {IEnrollResponse} from 'fabric-ca-client';

import {Log} from '../../common/utils/logging/Log';
import {FabricInfo} from './enums/FabricInfo';
import {FabricError} from './enums/FabricError';
import {TransactionResponse} from './models/TransactionResponse';

import {IOrganization} from '../../common/interfaces/organization.interface';
import {AuthService} from '../authentication/auth.service';


@Injectable()
export class FabricConnectorService {

  private connectionProfile: any;
  private fabricClient: Client;
  private fabricCAClient: FabricCAServices;
  private fabricPeers: Peer[] = [];
  private fabricOrderers: Orderer[] = [];
  private fabricChannels: {[key: string]: Channel} = {};
  private fabricEventHubs: {[key: string]: ChannelEventHub} = {};

  public constructor( private authService: AuthService ){

    this.init();
  }


  private async init(): Promise<void> {
    try {

      Log.fabric.info(FabricInfo.INIT_FABRIC);

      this.connectionProfile = yaml.safeLoad(fs.readFileSync(process.env.CONNECTION_PROFILE, 'utf8'));
      Log.fabric.info(FabricInfo.CONNECTION_PROFILE_SUCCESS, process.env.CONNECTION_PROFILE);

      await this.instantiateFabricClient();
      Log.fabric.info(FabricInfo.INIT_FABRIC_CLIENT_SUCCESS);

      await this.instantiateFabricCAServices();
      Log.fabric.info(FabricInfo.INIT_FABRIC_CA_SERVICES_SUCCESS);
      
      await this.setUserContext();
      Log.fabric.info(FabricInfo.USER_CONTEXT_SET, this.connectionProfile.identity.username);

      await this.connectChannelEventHubs();
      Log.fabric.info(FabricInfo.CONNECTED_EVENT_HUBS);

      Log.fabric.info(FabricInfo.INIT_FABRIC_SUCCESS);
      Log.fabric.info(FabricInfo.READY);
    }
    catch (error) {
      Log.fabric.error(FabricError.INIT_FAILURE);
//      throw new Error(FabricError.INIT_FAILURE + error);
      process.exit(1);
    }
  }


  private async instantiateFabricClient(): Promise<void> {

    this.fabricClient = new Client();

    this.fabricClient.setStateStore(await Client.newDefaultKeyValueStore({path: this.connectionProfile.client.credentialStore.path}));

    if (this.connectionProfile.client.tls.enabled) {
      const clientCert = fs.readFileSync(this.connectionProfile.client.tls.clientCert);
      const clientKey = fs.readFileSync(this.connectionProfile.client.tls.clientKey);
      this.fabricClient.setTlsClientCertAndKey(Buffer.from(clientCert).toString(), Buffer.from(clientKey).toString());
    }

    const cryptoSuite: ICryptoSuite = Client.newCryptoSuite();
    cryptoSuite.setCryptoKeyStore(await Client.newCryptoKeyStore({path: this.connectionProfile.client.credentialStore.path}));
    this.fabricClient.setCryptoSuite(cryptoSuite);

    /* Set amdin key */
    const adminKey = fs.readFileSync(this.connectionProfile.client.clientKey);
    const adminCert = fs.readFileSync(this.connectionProfile.client.clientCert);
    this.fabricClient.setAdminSigningIdentity(
      Buffer.from(adminKey).toString(),
      Buffer.from(adminCert).toString(),
      this.connectionProfile.client.mspid);

    /* Set peer and orderer */
    let peer: Peer;
    let orderer: Orderer;
    if (this.connectionProfile.client.tls.enabled) {
      /* With TLS */
      const serverCaCert = fs.readFileSync(this.connectionProfile.peers[process.env.PEER_NAME].tlsCACerts.path);
      peer = this.fabricClient.newPeer(this.connectionProfile.peers[process.env.PEER_NAME].urlGrpcs, {pem: Buffer.from(serverCaCert).toString()});
      const ordererCaCert = fs.readFileSync(this.connectionProfile.orderers[process.env.ORDERER_NAME].tlsCACerts.path);
      orderer = this.fabricClient.newOrderer(this.connectionProfile.orderers[process.env.ORDERER_NAME].urlGrpcs, {pem: Buffer.from(ordererCaCert).toString()});
    }
    else {
      /* Without TLS */
      peer = this.fabricClient.newPeer(this.connectionProfile.peers[process.env.PEER_NAME].url);
      orderer = this.fabricClient.newOrderer(this.connectionProfile.orderers[process.env.ORDERER_NAME].url);
    }
    this.fabricPeers.push(peer);
    this.fabricOrderers.push(orderer);

    /* Set channels */

    let channel: Channel;

    this.connectionProfile.client.channels.forEach((channelProfile) => {
      channel = this.fabricClient.newChannel(channelProfile.id);
      channel.addPeer(peer, this.connectionProfile.client.mspid);
      channel.addOrderer(orderer);
      this.fabricChannels[channelProfile.id] = channel;
    });

  }



  private async instantiateFabricCAServices(): Promise<void> {

    if (this.connectionProfile.client.tls.enabled) {
      /* With TLS */
      const tslCACert = fs.readFileSync(this.connectionProfile.certificateAuthorities[process.env.CA_NAME].tlsCACerts.path);
      this.fabricCAClient = new FabricCAServices(
        this.connectionProfile.certificateAuthorities[process.env.CA_NAME].urlHttps,
        {
          trustedRoots: Buffer.from(tslCACert),
          verify: true
        },
        this.connectionProfile.certificateAuthorities[process.env.CA_NAME].caName,
        this.fabricClient.getCryptoSuite()
      );
    }
    else {
      /* Without TLS */
      this.fabricCAClient = new FabricCAServices(
        this.connectionProfile.certificateAuthorities[process.env.CA_NAME].url,
        {
          trustedRoots: Buffer.from(''),
          verify: false
        },
        this.connectionProfile.certificateAuthorities[process.env.CA_NAME].caName,
        this.fabricClient.getCryptoSuite()
      );
    }

  }


  private async setUserContext(): Promise<void> {

    const checkPersistence: boolean = true;
    let user: User | void = await this.fabricClient.getUserContext(this.connectionProfile.identity.username, checkPersistence);

    if (!user) {
      /* If user not found, enroll user */
      const enrollment: IEnrollResponse = await this.fabricCAClient.enroll({
        enrollmentID: this.connectionProfile.identity.username,
        enrollmentSecret: this.connectionProfile.identity.password
      });
      if (enrollment) {
        Log.fabric.info(FabricInfo.USER_ENROLLED, this.connectionProfile.identity.username);

        /* and create user */
        user = await this.fabricClient.createUser({
          username: this.connectionProfile.identity.username,
          mspid: this.connectionProfile.client.mspid,
          cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate },
          skipPersistence: false
        });
      }
    }

    if (!user) {
      Log.fabric.error(FabricError.USER_ENROLLMENT_FAILURE + this.connectionProfile.identity.username);
      throw new Error(FabricError.USER_ENROLLMENT_FAILURE + this.connectionProfile.identity.username);
    }
    else {
      await this.fabricClient.setUserContext(user);
    }
  }


  private async connectChannelEventHubs(): Promise<void> {
  
    let channelEventHub: ChannelEventHub;
    const eventHubConnectionPromises: Promise<void>[] = [];

    for (const channelId of Object.keys(this.fabricChannels)) {

      channelEventHub = this.fabricChannels[channelId].newChannelEventHub(this.fabricPeers[0]);
      this.fabricEventHubs[channelId] = channelEventHub;
//      channelEventHub.disconnect();

      const eventHubConnectionTimeout: number = 10000;
      eventHubConnectionPromises.push( new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          channelEventHub.disconnect();
          Log.fabric.error(FabricError.EVENTHUB_CONNECTION_TIMEOUT);
          reject(new Error(FabricError.EVENTHUB_CONNECTION_TIMEOUT));
        }, eventHubConnectionTimeout);
        channelEventHub.connect(
          {full_block: false},
          (error, value) => {
            clearTimeout(timeout);
            if (error) {
              Log.fabric.error(FabricError.EVENTHUB_CONNECTION_FAILURE, error);
              reject(error);
            }
            else {
              resolve();
            }
          }
        );
      }));
    }; // For

    await Promise.all(eventHubConnectionPromises);  

  }


  public async invoke(chaincodeFunction: string, functionArguments: any[], channelName: string): Promise<TransactionResponse> {

    /* Create and send transaction proposal */
    Log.fabric.info(FabricInfo.SEND_TRANSACTION_PROPOSAL, chaincodeFunction);

    let chaincodeId: string | null = null;
    for (const chaincode of this.connectionProfile.client.chaincodes) {
      if (chaincode.channelName === channelName) {
        chaincodeId = chaincode.chaincodeId;
        break;
      }
    }
    if (chaincodeId === null) {
      Log.fabric.error(FabricError.INVALID_CHANNEL + channelName);
      throw new Error(FabricError.INVALID_CHANNEL + channelName);
    }

    const transactionId: TransactionId = this.fabricClient.newTransactionID();
    const organization: IOrganization = this.authService.getOrganization();
    const chaincodeArguments: string[] = [JSON.stringify(functionArguments), JSON.stringify(organization)];
    const request: ChaincodeInvokeRequest = {
      targets: this.fabricPeers,
      chaincodeId: chaincodeId,
      txId: transactionId,
      fcn: chaincodeFunction,
      args: chaincodeArguments
    };
    
    const transactionProposalTimeout: number = 10000;
    const proposalResponseObject: ProposalResponseObject = await this.fabricChannels[channelName].sendTransactionProposal(request, transactionProposalTimeout); 

    Log.fabric.info(FabricInfo.CHECK_TRANSACTION_PROPOSAL);

    /* Check transaction proposal success */
    if (!proposalResponseObject[0]) {
      Log.fabric.error(FabricError.TRANSACTION_PROPOSAL_FAILURE + ' (Bad proposal response object)');
      
      throw new Error(FabricError.TRANSACTION_PROPOSAL_FAILURE + ' (Bad proposal response object)');
    }
    // If error message (assuming only one poposal response to check)
    if (proposalResponseObject[0][0] instanceof Error) {
      const error: Error = proposalResponseObject[0][0] as Error;
      Log.fabric.error(FabricError.TRANSACTION_PROPOSAL_FAILURE + error.message);

//      throw new Error(error.message);
      return Promise.reject(error);
    }

    const proposalResponse: ProposalResponse = proposalResponseObject[0][0] as ProposalResponse;
    if (!proposalResponse.response) {
      Log.fabric.error(FabricError.TRANSACTION_PROPOSAL_FAILURE + ' (Bad proposal response object)');
      
      throw new Error(FabricError.TRANSACTION_PROPOSAL_FAILURE + ' (Bad proposal response object)');
    }
    if (!(proposalResponse.response.status === 200)) {
      Log.fabric.error(FabricError.TRANSACTION_PROPOSAL_FAILURE);
      
      return Promise.reject(proposalResponse.response);
    }

    Log.fabric.info(FabricInfo.TRANSACTION_PROPOSAL_CHECKED);


    /* Process transaction (send and check) */
    Log.fabric.info(FabricInfo.PROCESSING_TRANSACTION);

    const broadcastResponsePromise: Promise<BroadcastResponse> = this.fabricChannels[channelName].sendTransaction({
      proposalResponses: [proposalResponse],
      proposal: proposalResponseObject[1]
    });


    const channelEventHub = this.fabricEventHubs[channelName];
    const txRegisterTimeout: number = 10000;

    const txRegisterPromise: Promise<null> = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        channelEventHub.unregisterTxEvent(transactionId.getTransactionID());
        Log.fabric.error(FabricError.TRANSACTION_REGISTERING_TIMEOUT);
        reject(new Error(FabricError.TRANSACTION_REGISTERING_TIMEOUT));
      }, txRegisterTimeout);
      channelEventHub.registerTxEvent(
        transactionId.getTransactionID(),
        () => {
          clearTimeout(timeout);
          resolve(null);
        },
        (error) => {
          clearTimeout(timeout);
          reject(error);
        }
      );
    });

    let broadcastResponse: BroadcastResponse;
    try {
      const promiseResponse: [BroadcastResponse,null] = await Promise.all<BroadcastResponse,null>([broadcastResponsePromise, txRegisterPromise]);
      broadcastResponse = promiseResponse[0];
      if (broadcastResponse.status === 'SUCCESS') {
        Log.fabric.info(FabricInfo.TRANSACTION_PROCESSED);
      }
      else {
        Log.fabric.error(FabricError.TRANSACTION_BROADCAST_FAILURE);
        throw new Error(FabricError.TRANSACTION_BROADCAST_FAILURE);
      }
    }
    catch (error) {
      Log.fabric.error(FabricError.TRANSACTION_PROCESSING_FAILURE);
      throw new Error(FabricError.TRANSACTION_PROCESSING_FAILURE + error);
    }


    /* Reconvert chaincode reponse into object */
    const responsePayload = JSON.parse(proposalResponse.response.payload.toString());

    const transactionResponse: TransactionResponse = new TransactionResponse(
      broadcastResponse.status,
      broadcastResponse.info,
      transactionId.getTransactionID(),
      responsePayload
    );
    
    return Promise.resolve(transactionResponse);
  }

  

  public async query(chaincodeFunction: string, functionArguments: any[], channelName: string): Promise<any> {

    /* Create and send query */
    Log.fabric.info(FabricInfo.QUERY_CHAINCODE, chaincodeFunction);

    let chaincodeId: string | null = null;
    for (const chaincode of this.connectionProfile.client.chaincodes) {
      if (chaincode.channelName === channelName) {
        chaincodeId = chaincode.chaincodeId;
        break;
      }
    }
    if (chaincodeId === null) {
      Log.fabric.error(FabricError.INVALID_CHANNEL + channelName);
      throw new Error(FabricError.INVALID_CHANNEL + channelName);
    }

    const transactionId: TransactionId = this.fabricClient.newTransactionID();
    const organization: IOrganization = this.authService.getOrganization();
    const chaincodeArguments: string[] = [JSON.stringify(functionArguments), JSON.stringify(organization)];
    const request: ChaincodeQueryRequest = {
      targets: this.fabricPeers,
      chaincodeId: chaincodeId,
      fcn: chaincodeFunction,
      args: chaincodeArguments,
      txId: transactionId
    };

    const responsePayloads: Buffer[] = await this.fabricChannels[channelName].queryByChaincode(request); 

    /* Check response payload */
    if (!(responsePayloads && responsePayloads[0].toString())) {
      Log.fabric.error(FabricError.QUERY_FAILURE + 'Bad response payload');
      
      return Promise.reject(new Error(FabricError.QUERY_FAILURE + 'Bad response payload'));
    }
    else {
      try {
        /* Reconvert chaincode reponse into object */
        const queryResponse: any = JSON.parse(responsePayloads[0].toString());
        
        return Promise.resolve(queryResponse);
      }
      catch (error) {
        Log.fabric.error(FabricError.QUERY_FAILURE + responsePayloads[0].toString());
        
        return Promise.reject(new Error(FabricError.QUERY_FAILURE + responsePayloads[0].toString()));
      }
    }
  }


}
