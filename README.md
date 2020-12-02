# STAR (Smart Traceability of the Activations of Renewable generation flexibilities)


## Getting started

### Prerequisites

- Docker community edition 18.09
- docker-compose 1.23
- NPM 6.x
- Node 8 or higher
- Clone the star repo on to your machine


### Install dependencies and build Chaincode

In the `chaincode/global` folder, run:
```
  npm install
  rm -rf ./dist
  npm run build
```
In the `chaincode/order` folder, run:
```
  npm install
  rm -rf ./dist
  npm run build
```


### Build and set up the Fabric network

In the `fabric-network` folder,
- to set up the Orderer service:
```
docker-compose -f docker-compose-fabric-orderer.yaml up -d
```

- to set up the TSO's CA, Peer and DB services:
```
docker-compose -f docker-compose-fabric-tso.yaml up -d
```

- to set up the DSO's CA, Peer and DB services:
```
docker-compose -f docker-compose-fabric-dso.yaml up -d
```

- to set up the Third's CA, Peer and DB services:
```
docker-compose -f docker-compose-fabric-third.yaml up -d
```

### Build and set up the STAR demo server, client and reverse proxy

In the `server` folder,
```
docker-compose -f docker-compose-tso.yaml up -d --build
docker-compose -f docker-compose-dso.yaml up -d --build
docker-compose -f docker-compose-bsp.yaml up -d --build
docker-compose -f docker-compose-producer.yaml up -d --build
```

### Access the login page
```
http://localhost:500X/login
```
where X is respectively {0, 1, 2, 3} for {TSO, DSO, BSP, PRODUCER}.

User emails are defined in `/server/config/xxx/connectionprofile/authConfiguration.json` and passwords are set to `passw0rd`.

## Swagger
To test the API endpoints, use the swagger documentation.
Nest automatically generates the swagger environments, which are accessible on each server.

Locally you can access swagger through:
```
http://localhost:300X/swagger
```
where X is respectively {0, 1, 2, 3} for {TSO, DSO, BSP, PRODUCER}.
