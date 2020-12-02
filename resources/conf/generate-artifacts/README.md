## Generating crypto-config and channel artifacts

To generate the crypto config and the channel artifacts, you first need to
get the `cryptogen` and `configtxgen` tools from:
https://github.com/hyperledger/fabric/releases/tag/v1.4.1
and put them in ./bin

(note: issue with version 1.4.8 of tools as some certs are not generated, e.g.:
crypto-config/peerOrganizations/tso.star.com/users/Admin@tso.star.com/msp/admincerts/)

Then you have to setup the configuration files:
- `configtx.yaml` 
- `crypto-config.yaml`
- `fabric-ca-server-config-tso.star.com.yaml`
- `fabric-ca-server-config-dso.star.com.yaml`


After that is in place, you can simply run `bash run_scripts.sh generate` to generate all
crypto materials. It is advised to first delete the existing crypto.

Do not forget to remove existing user credentials from the server in `./server/credentials/xxx`
since they are connected to the previous crypto material.
