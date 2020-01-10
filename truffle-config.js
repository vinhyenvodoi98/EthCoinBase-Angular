const path = require('path');
var HDWalletProvider = require('truffle-hdwallet-provider');
MNENOMIC = process.env.MNENOMIC;
INFURA_API_KEY = process.env.INFURA_API_KEY;
require('dotenv').config();

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1', // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: '*' // Any network (default: none)
    },
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
    },
    ropsten: {
      provider: () =>
        new HDWalletProvider(MNENOMIC, 'https://ropsten.infura.io/v3/' + INFURA_API_KEY),
      network_id: 3,
      gas: 4612388
    },
    kovan: {
      provider: () =>
        new HDWalletProvider(MNENOMIC, 'https://kovan.infura.io/v3/' + INFURA_API_KEY),
      network_id: 42,
      gas: 470000,
      gasPrice: 21
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider(MNENOMIC, 'https://rinkeby.infura.io/v3/' + INFURA_API_KEY),
      network_id: 4,
      gas: 470000,
      gasPrice: 21
    }
  }
};
