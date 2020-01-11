const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*' // Match any network id
    },
    ropsten: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`
        ),
      gas: 4712388,
      gasPrice: 100000000000,
      network_id: '*'
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`
        );
      },
      network_id: '*'
    },
    truffleTestnet: {
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, `http://localhost:9545`);
      },
      network_id: '*'
    },
    tomotestnet: {
      provider: () =>
        new HDWalletProvider(process.env.MNEMONIC, 'https://testnet.tomochain.com', 0, 1, true),
      network_id: '89',
      gas: 3000000,
      gasPrice: 20000000000000,
      gasLimit: 1000000
    }
  }
};
