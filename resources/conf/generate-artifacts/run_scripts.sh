#!/bin/bash

export PATH=${PWD}/bin:${PWD}:$PATH
export VERBOSE=false

. scripts/generate-crypto.sh
. scripts/rename-crypto.sh

if [ "$1" = "-m" ]; then
  shift
fi
MODE=$1
shift

if [ "${MODE}" == "generate" ]; then
  generateCerts
  generateChannelArtifacts
  replacePrivateKey
fi
