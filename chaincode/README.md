## Chaincode

The star project contains two chaincodes. Global and order chaincode. Both versions contain the same format 
and work the same way.

### Testing the chaincode

To test the functions in the chaincode, you can run unit tests that are in the test folder for each chaincode.

To run a full test, execute the following command in one of the chaincode folders:
```
npm run test
```

While developing, its useful to add a watch to the tests. It automatically runs tests again when changes are 
made to the code. You can add the watcher by executing the following command:

```
npm run test:watch
```

### Creating a dist folder

In order to install and instantiate the chaincode, the chaincode needs to be built first. Run the following 
command to create a dist folder in your chaincode:

```$xslt
npm run build
```

** Note: When running `npm run startFabric` in the root folder, it automatically builds the chaincodes for you.
