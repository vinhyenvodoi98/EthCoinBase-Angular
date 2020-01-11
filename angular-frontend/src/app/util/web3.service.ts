import { Injectable } from "@angular/core";
import contract from "truffle-contract";
import { Subject } from "rxjs";
declare let require: any;
const Web3 = require("web3");

declare let window: any;

@Injectable({
  providedIn: "root"
})
export class Web3Service {
  public web3: any;
  private accounts: string[];
  public balance: string[];
  public ready = false;

  public accountsObservable = new Subject<string[]>();
  constructor() {
    window.addEventListener("load", event => {
      this.bootstrapWeb3();
    });
  }

  public async bootstrapWeb3() {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    if (window.ethereum) {
      try {
        // Request account access if needed
        await window.ethereum.enable();
        // Acccounts now exposed
        this.web3 = new Web3(window.ethereum);
      } catch (error) {
        console.error(error);
      }
    } else if (typeof window.web3 !== "undefined") {
      // Checking if Web3 has been injected by the browser (Mist/MetaMask)
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.log("No web3? You should consider trying MetaMask!");

      // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
      Web3.providers.HttpProvider.prototype.sendAsync =
        Web3.providers.HttpProvider.prototype.send;
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(
        new Web3.providers.HttpProvider("http://localhost:8545")
      );
    }

    setInterval(() => this.refreshAccounts(), 1000);
  }

  public async artifactsToContract(artifacts) {
    if (!this.web3) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.artifactsToContract(artifacts);
    }

    const contractAbstraction = contract(artifacts);
    contractAbstraction.setProvider(this.web3.currentProvider);
    return contractAbstraction;
  }

  private refreshAccounts() {
    this.web3.eth.getAccounts(async (err, accs) => {
      console.log("Refreshing accounts");
      if (err != null) {
        console.warn("There was an error fetching your accounts.");
        return;
      }

      // Get the initial account balance so it can be displayed.
      if (accs.length === 0) {
        console.warn(
          "Couldn't get any accounts! Make sure your Ethereum client is configured correctly."
        );
        return;
      }

      if (
        !this.accounts ||
        this.accounts.length !== accs.length ||
        this.accounts[0] !== accs[0]
      ) {
        console.log("Observed new accounts");

        this.accountsObservable.next(accs);
        this.accounts = accs;
      }

      this.ready = true;
    });
  }
}
