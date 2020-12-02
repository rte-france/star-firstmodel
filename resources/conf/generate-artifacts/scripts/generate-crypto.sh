#!/usr/bin/env bash

function generateCerts() {
  which cryptogen
  if [ "$?" -ne 0 ]; then
    echo "cryptogen tool not found. exiting"
    exit 1
  fi
  echo
  echo "##########################################################"
  echo "##### Generate certificates using cryptogen tool #########"
  echo "##########################################################"

  if [ -d "crypto-config" ]; then
    rm -Rf crypto-config
  fi
  set -x
  cryptogen generate --config=./crypto-config.yaml
  res=$?
  set +x
  if [ $res -ne 0 ]; then
    echo "Failed to generate certificates..."
    exit 1
  fi
  echo

  sudo chown -R $UID crypto-config

  cp ./fabric-ca-server-config-dso.star.com.yaml crypto-config/peerOrganizations/dso.star.com/ca/fabric-ca-server-config.yaml
  cp ./fabric-ca-server-config-tso.star.com.yaml crypto-config/peerOrganizations/tso.star.com/ca/fabric-ca-server-config.yaml
}

function generateChannelArtifacts() {
  which configtxgen
  if [ "$?" -ne 0 ]; then
    echo "configtxgen tool not found. exiting"
    exit 1
  fi

  if [ -d "channel-artifacts" ]; then
    rm channel-artifacts/*
  else
    mkdir channel-artifacts
  fi

  echo "##########################################################"
  echo "#########  Generating Orderer Genesis block ##############"
  echo "##########################################################"
  # Note: For some unknown reason (at least for now) the block file can't be
  # named orderer.genesis.block or the orderer will fail to launch!
  set -x
  configtxgen -profile StarOrdererGenesis -outputBlock ./channel-artifacts/genesis.block
  res=$?
  set +x
  if [ $res -ne 0 ]; then
    echo "Failed to generate orderer genesis block..."
    exit 1
  fi
  echo
  echo "#################################################################"
  echo "### Generating channel configuration transaction 'channel.tx' ###"
  echo "#################################################################"
  set -x
  configtxgen -profile starnetwork -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID starnetwork
  echo "StarNetwork channel created"

  configtxgen -profile starnetworkorder -outputCreateChannelTx ./channel-artifacts/channel-order.tx -channelID starnetworkorder
  echo "StarNetworkOrder channel created"
  res=$?
  set +x
  if [ $res -ne 0 ]; then
    echo "Failed to generate channel configuration transaction..."
    exit 1
  fi

  echo
  echo "#################################################################"
  echo "###            Generating anchor peer configuration'          ###"
  echo "#################################################################"
  set -x
  configtxgen -profile starnetwork -outputAnchorPeersUpdate ./channel-artifacts/Org0anchors.tx -channelID starnetwork -asOrg TSOMSP
  echo "starnetwork anchor TSO peer config created"

  configtxgen -profile starnetwork -outputAnchorPeersUpdate ./channel-artifacts/THIRDanchors.tx -channelID starnetwork -asOrg THIRDMSP
  echo "starnetwork anchor THIRD peer config created"

  configtxgen -profile starnetwork -outputAnchorPeersUpdate ./channel-artifacts/Org1anchors.tx -channelID starnetwork -asOrg DSOMSP
  echo "starnetwork anchor DSO peer config created"

  configtxgen -profile starnetworkorder -outputAnchorPeersUpdate ./channel-artifacts/TSOanchors.tx -channelID starnetworkorder -asOrg TSOMSP
  echo "starnetworkorder anchor TSO peer config created"

  configtxgen -profile starnetworkorder -outputAnchorPeersUpdate ./channel-artifacts/DSOanchors.tx -channelID starnetworkorder -asOrg DSOMSP
  echo "starnetworkorder anchor DSO peer config created"

  res=$?
  set +x
  if [ $res -ne 0 ]; then
    echo "Failed to generate channel configuration transaction..."
    exit 1
  fi
}
