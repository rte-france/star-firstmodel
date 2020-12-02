#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

function replacePrivateKey () {
  CURRENT_DIR=$PWD

  # set -x
  cd crypto-config/ordererOrganizations/star.com/ca/
  RANDOM_PRIV_KEY=$(ls *_sk)
  mv ${RANDOM_PRIV_KEY} ca.star.com_sk
  cd "$CURRENT_DIR"

  cd crypto-config/ordererOrganizations/star.com/orderers/orderer.star.com/msp/keystore
  RANDOM_PRIV_KEY=$(ls *_sk)
  mv ${RANDOM_PRIV_KEY} orderer.star.com_sk
  cd "$CURRENT_DIR"

  cd crypto-config/ordererOrganizations/star.com/tlsca
  RANDOM_PRIV_KEY=$(ls *_sk)
  mv ${RANDOM_PRIV_KEY} tlsca.star.com_sk
  cd "$CURRENT_DIR"

  cd crypto-config/peerOrganizations/third.star.com/ca/
  RANDOM_PRIV_KEY=$(ls *_sk)
  mv ${RANDOM_PRIV_KEY} ca.third.star.com_sk
  cd "$CURRENT_DIR"

  cd crypto-config/peerOrganizations/bsp.star.com/ca/
  RANDOM_PRIV_KEY=$(ls *_sk)
  mv ${RANDOM_PRIV_KEY} ca.bsp.star.com_sk
  cd "$CURRENT_DIR"

  cd crypto-config/peerOrganizations/bsp.star.com/tlsca
  RANDOM_PRIV_KEY=$(ls *_sk)
  mv ${RANDOM_PRIV_KEY} tlsca.bsp.star.com_sk
  cd "$CURRENT_DIR"

  cd crypto-config/peerOrganizations/bsp.star.com/users/Admin@bsp.star.com/msp/keystore
  RANDOM_PRIV_KEY=$(ls *_sk)
  mv ${RANDOM_PRIV_KEY} Admin@bsp.star.com_sk
  cd "$CURRENT_DIR"

  cd crypto-config/peerOrganizations/producer.star.com/ca/
  RANDOM_PRIV_KEY=$(ls *_sk)
  mv ${RANDOM_PRIV_KEY} ca.producer.star.com_sk
  cd "$CURRENT_DIR"

  cd crypto-config/peerOrganizations/producer.star.com/tlsca
  RANDOM_PRIV_KEY=$(ls *_sk)
  mv ${RANDOM_PRIV_KEY} tlsca.producer.star.com_sk
  cd "$CURRENT_DIR"

  cd crypto-config/peerOrganizations/producer.star.com/users/Admin@producer.star.com/msp/keystore
  RANDOM_PRIV_KEY=$(ls *_sk)
  mv ${RANDOM_PRIV_KEY} Admin@producer.star.com_sk
  cd "$CURRENT_DIR"

  cd crypto-config/peerOrganizations/dso.star.com/ca/
  RANDOM_PRIV_KEY=$(ls *_sk)
  mv ${RANDOM_PRIV_KEY} ca.dso.star.com_sk
  cd "$CURRENT_DIR"

  cd crypto-config/peerOrganizations/dso.star.com/peers/peer0.dso.star.com/msp/keystore
  RANDOM_PRIV_KEY=$(ls *_sk)
  mv ${RANDOM_PRIV_KEY} peer0.dso.star.com_sk
  cd "$CURRENT_DIR"

  cd crypto-config/peerOrganizations/dso.star.com/tlsca
  RANDOM_PRIV_KEY=$(ls *_sk)
  mv ${RANDOM_PRIV_KEY} tlsca.dso.star.com_sk
  cd "$CURRENT_DIR"

  cd crypto-config/peerOrganizations/dso.star.com/users/Admin@dso.star.com/msp/keystore
  RANDOM_PRIV_KEY=$(ls *_sk)
  mv ${RANDOM_PRIV_KEY} Admin@dso.star.com_sk
  cd "$CURRENT_DIR"

   cd crypto-config/peerOrganizations/dso.star.com/users/User1@dso.star.com/msp/keystore
  RANDOM_PRIV_KEY=$(ls *_sk)
  mv ${RANDOM_PRIV_KEY} User1@dso.star.com_sk
  cd "$CURRENT_DIR"

  cd crypto-config/peerOrganizations/tso.star.com/ca/
  RANDOM_PRIV_KEY=$(ls *_sk)
  mv ${RANDOM_PRIV_KEY} ca.tso.star.com_sk
  cd "$CURRENT_DIR"

  cd crypto-config/peerOrganizations/tso.star.com/peers/peer0.tso.star.com/msp/keystore
  RANDOM_PRIV_KEY=$(ls *_sk)
  mv ${RANDOM_PRIV_KEY} peer0.tso.star.com_sk
  cd "$CURRENT_DIR"

  cd crypto-config/peerOrganizations/tso.star.com/tlsca
  RANDOM_PRIV_KEY=$(ls *_sk)
  mv ${RANDOM_PRIV_KEY} tlsca.tso.star.com_sk
  cd "$CURRENT_DIR"

  cd crypto-config/peerOrganizations/tso.star.com/users/Admin@tso.star.com/msp/keystore
  RANDOM_PRIV_KEY=$(ls *_sk)
  mv ${RANDOM_PRIV_KEY} Admin@tso.star.com_sk
  cd "$CURRENT_DIR"


  cd crypto-config/peerOrganizations/tso.star.com/users/User1@tso.star.com/msp/keystore
  RANDOM_PRIV_KEY=$(ls *_sk)
  mv ${RANDOM_PRIV_KEY} User1@tso.star.com_sk
  cd "$CURRENT_DIR"
}
