import { Component, OnInit } from "@angular/core";
import { Web3Service } from "../../util/web3.service";
import { MatSnackBar } from "@angular/material/snack-bar";

declare let require: any;
const metacoin_artifacts = require("../../../../../build/contracts/MetaCoin.json");

@Component({
  selector: "app-meta-component",
  templateUrl: "./meta-component.component.html",
  styleUrls: ["./meta-component.component.css"]
})
export class MetaComponentComponent implements OnInit {
  accounts: string[];
  MetaCoin: any;

  model = {
    amount: 5,
    receiver: "",
    accountBalance: "",
    balance: 0,
    account: ""
  };

  status = "";

  constructor(
    private web3Service: Web3Service,
    private matSnackBar: MatSnackBar
  ) {
    console.log("Constructor: " + web3Service);
  }

  ngOnInit(): void {
    this.watchAccount();
    this.web3Service
      .artifactsToContract(metacoin_artifacts)
      .then(MetaCoinAbstraction => {
        this.MetaCoin = MetaCoinAbstraction;
        this.MetaCoin.deployed().then(deployed => {
          console.log(deployed);
          deployed.Transfer({}, (err, ev) => {
            console.log("Transfer event came in, refreshing balance");
            this.refreshBalance();
          });
        });
      });
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe(accounts => {
      this.accounts = accounts;
      this.model.account = accounts[0];
      this.refreshBalance();
      this.refreshAccountBalance();
    });
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, { duration: 3000 });
  }

  async sendCoin() {
    if (!this.MetaCoin) {
      this.setStatus("Metacoin is not loaded, unable to send transaction");
      return;
    }

    const amount = this.model.amount;
    const receiver = this.model.receiver;

    console.log("Sending coins" + amount + " to " + receiver);

    this.setStatus("Initiating transaction... (please wait)");
    try {
      const deployedMetaCoin = await this.MetaCoin.deployed();
      const transaction = await deployedMetaCoin.sendCoin.sendTransaction(
        receiver,
        amount,
        { from: this.model.account }
      );

      if (!transaction) {
        this.setStatus("Transaction failed!");
      } else {
        this.setStatus("Transaction complete!");
      }
    } catch (e) {
      console.log(e);
      this.setStatus("Error sending coin; see log.");
    }
  }

  async refreshBalance() {
    console.log("Refreshing balance");

    try {
      const deployedMetaCoin = await this.MetaCoin.deployed();
      console.log(deployedMetaCoin);
      console.log("Account", this.model.account);
      const metaCoinBalance = await deployedMetaCoin.getBalance.call(
        this.model.account
      );
      console.log("Found balance: " + metaCoinBalance);
      this.model.balance = metaCoinBalance;
    } catch (e) {
      console.log(e);
      this.setStatus("Error getting balance; see log.");
    }
  }

  async refreshAccountBalance() {
    // this.model.accountBalance = this.web3Service.web3.utils.fromWei(
    //   await this.web3Service.web3.eth.getBalance(this.accounts)
    // );
  }

  setAmount(e) {
    console.log("Setting amount: " + e.target.value);
    this.model.amount = e.target.value;
  }

  setReceiver(e) {
    console.log("Setting receiver: " + e.target.value);
    this.model.receiver = e.target.value;
  }
}
