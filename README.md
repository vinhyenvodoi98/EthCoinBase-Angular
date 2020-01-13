# EthCoinBase-Angular

Mở đầu 
Để tiếp tục series xây dựng Dapp, bài này sẽ hướng dẫn xây dựng sample Dapp bằng framework Angular8. về cơ bản thì chúng ta sẽ xây dựng một ứng dụng dựa trên **smart contract** đã được xây dựng trong bài đầu tiên :[ Xây dựng smart contract](https://viblo.asia/p/xay-dung-ung-dung-phi-tap-trung-dapp-gAm5y8LLldb#_frontend-3)

Về cơ bản chúng ta sẽ sử dụng smart contract đã có và xây dựng ứng dụng chuyển các token như đã thực hiện với React. Đối với Angular thì sẽ có một số thứ cần thay đổi tuy nhiên tư tưởng về cơ bản sẽ khá giống nhau

## Chuẩn bị
### Môi trường
Chúng ta install Angular
```
npm install -g @angular/cli
# OR
yarn global add @angular/cli
```

Ta chạy lệnh `ng n` để khởi tạo project 
```
ng n angular-frontend
```
![](https://images.viblo.asia/8b67da75-44b2-4b82-af97-0374fe31587a.png)

Để cho đúng vị chúng ta sử dụng Angular Material design để phần giao diện đẹp hơn

Install Angular Material
```
ng add @angular/material
```

Cũng giống như Redux trong React hay Vuex trong Vue .Để quản lý state tree chúng ta dùng [RxJS](https://ngrx.io/guide/store) 
```
yarn add @ngrx/{store,effects,router-store,entity,store-devtools} ngrx-store-freeze --save
```

Tiếp đến là các package như web3, truffle-contract để connect vs web3 và contract
```
yarn add truffle-contract@4.0.31 web3@1.2.4
```

Để chạy project ta sử dụng lệnh 
```ts
ng s
```
## Triển khai ứng dụng

### Web3 connect
Để có thể kết nối với Web3 ta sẽ tạo một **util module** . Angular cung cấp cho chúng ta một bộ Cli miễn chê vào đâu đc ta chỉ cần chạy lệnh 

```
ng g module util
```

Lệnh này sẽ tạo ra **file util.module.ts** chúng ta sẽ thêm **Web3Service** và được file hoàn chỉnh 
```ts
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Web3Service } from "./web3.service";

@NgModule({
  imports: [CommonModule],
  providers: [Web3Service],
  declarations: []
})
export class UtilModule {}
```

Nhưng khoan Web3service đâu rồi ??? Để tạo Web3 service ta sử dụng lệnh
```
ng g service util/web3
```

Lệnh này sẽ tạo 2 file **web3.service.spec.ts** ( file này phục vụ cho việc chạy test nên tạm thời chúng ta chưa cần sửa ) và **web3.service.ts** ( chúng ta sẽ code thêm vào file này )

```ts
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
```

Giải thích :
*  **public async bootstrapWeb3()** : hàm này dùng để lấy web3 , nếu brower có metamask thì liên kết với metamak, nếu không sẽ lấy 
```
web3 = new Web3.providers.HttpProvider("http://localhost:8545")
``` 
và sau đó thực hiện polling cứ 1s cập nhật account trong trường hợp khi sử dụng app ng dùng muốn đổi account
*  **private refreshAccounts()** :  hàm này để lấy account
*  **public async artifactsToContract(artifacts)** : hàm này để  connect tới contract vs tham số đầu vào là link tới file abi

### Giao diện
Tiếp theo ta tạo **module meta**
```
ng g module meta
```
Sau đó tạo **component meta-component** để code frontend
```
ng g component meta/meta_component
```
Ta chỉnh sửa **meta.module.ts**
```ts
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MetaComponentComponent } from "./meta-component/meta-component.component";
import {
  MatSnackBarModule,
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatOptionModule,
  MatSelectModule
} from "@angular/material";

@NgModule({
  declarations: [MetaComponentComponent],
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  exports: [MetaComponentComponent]
})
export class MetaModule {}
```

Mình đã thêm vào một số module của Material Design để code frontend luôn

 Import thêm **MetaModule** và **app.module.ts**
 ```ts
 import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { UtilModule } from "./util/util.module";
import { MetaModule } from "./meta/meta.module";

import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, BrowserAnimationsModule, UtilModule, MetaModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
 ```
 Xóa hết code html trong file **app.component.html** của app đi thay bằng tag **selector** của meta-component mà chúng ta tạo bên trên
 
 File **app.component.html** 
 ```html
<app-meta-component></app-meta-component>
```
Bây h công việc của chúng ta là sẽ code trong file meta

Đầu tiên là **meta-component.comopnent.ts**
```ts
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

  setAmount(e) {
    console.log("Setting amount: " + e.target.value);
    this.model.amount = e.target.value;
  }

  setReceiver(e) {
    console.log("Setting receiver: " + e.target.value);
    this.model.receiver = e.target.value;
  }
}
```

Tiếp theo là **meta-component.component.html**

```html
<div flex="70" flex-offset="15">
  <div class="card-container" role="banner">
    <img
      width="120"
      alt="Angular Logo"
      src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTAgMjUwIj4KICAgIDxwYXRoIGZpbGw9IiNERDAwMzEiIGQ9Ik0xMjUgMzBMMzEuOSA2My4ybDE0LjIgMTIzLjFMMTI1IDIzMGw3OC45LTQzLjcgMTQuMi0xMjMuMXoiIC8+CiAgICA8cGF0aCBmaWxsPSIjQzMwMDJGIiBkPSJNMTI1IDMwdjIyLjItLjFWMjMwbDc4LjktNDMuNyAxNC4yLTEyMy4xTDEyNSAzMHoiIC8+CiAgICA8cGF0aCAgZmlsbD0iI0ZGRkZGRiIgZD0iTTEyNSA1Mi4xTDY2LjggMTgyLjZoMjEuN2wxMS43LTI5LjJoNDkuNGwxMS43IDI5LjJIMTgzTDEyNSA1Mi4xem0xNyA4My4zaC0zNGwxNy00MC45IDE3IDQwLjl6IiAvPgogIDwvc3ZnPg=="
    />
  </div>

  <mat-card class="card">
    <mat-card-header>Balance</mat-card-header>
    <mat-card-content>
      <mat-form-field id="address-selector" class="address-field">
        <mat-select
          name="account"
          (selectionChange)="refreshBalance()"
          [(value)]="model.account"
          placeholder="Address"
        >
          <mat-option *ngFor="let account of accounts" [value]="account">{{
            account
          }}</mat-option>
        </mat-select>
      </mat-form-field>

      <p>
        You have <span id="balance">{{ model.balance }}</span> META
      </p>
    </mat-card-content>
  </mat-card>

  <mat-card class="card">
    <mat-card-header>Send MetaCoin</mat-card-header>
    <mat-card-content>
      <div class="send-metacoin">
        <mat-form-field class="address-field">
          <input
            type="text"
            matInput
            id="amount"
            placeholder="Amount"
            (change)="setAmount($event)"
          />
          <span matPrefix>$&nbsp;</span>
          <span matSuffix>.00</span>
        </mat-form-field>
        <mat-form-field class="address-field">
          <input
            type="text"
            matInput
            id="receiver"
            placeholder="Receiver Address"
            (change)="setReceiver($event)"
          />
        </mat-form-field>
      </div>

      <!-- <button >Basic</button> -->
      <button mat-raised-button id="send" (click)="sendCoin()">
        Send MetaCoin
      </button>
    </mat-card-content>
  </mat-card>

  <svg
    id="clouds"
    alt="Gray Clouds Background"
    xmlns="http://www.w3.org/2000/svg"
    width="2611.084"
    height="485.677"
    viewBox="0 0 2611.084 485.677"
  >
    <path
      id="Path_39"
      data-name="Path 39"
      d="M2379.709,863.793c10-93-77-171-168-149-52-114-225-105-264,15-75,3-140,59-152,133-30,2.83-66.725,9.829-93.5,26.25-26.771-16.421-63.5-23.42-93.5-26.25-12-74-77-130-152-133-39-120-212-129-264-15-54.084-13.075-106.753,9.173-138.488,48.9-31.734-39.726-84.4-61.974-138.487-48.9-52-114-225-105-264,15a162.027,162.027,0,0,0-103.147,43.044c-30.633-45.365-87.1-72.091-145.206-58.044-52-114-225-105-264,15-75,3-140,59-152,133-53,5-127,23-130,83-2,42,35,72,70,86,49,20,106,18,157,5a165.625,165.625,0,0,0,120,0c47,94,178,113,251,33,61.112,8.015,113.854-5.72,150.492-29.764a165.62,165.62,0,0,0,110.861-3.236c47,94,178,113,251,33,31.385,4.116,60.563,2.495,86.487-3.311,25.924,5.806,55.1,7.427,86.488,3.311,73,80,204,61,251-33a165.625,165.625,0,0,0,120,0c51,13,108,15,157-5a147.188,147.188,0,0,0,33.5-18.694,147.217,147.217,0,0,0,33.5,18.694c49,20,106,18,157,5a165.625,165.625,0,0,0,120,0c47,94,178,113,251,33C2446.709,1093.793,2554.709,922.793,2379.709,863.793Z"
      transform="translate(142.69 -634.312)"
      fill="#eee"
    />
  </svg>
</div>
```

Một chút CSS **meta-component.component.css**
```css
.card {
  margin: 20px 80px;
  background-color: #fafafa;
}

.image-center {
  margin: auto;
}

.card-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

svg#clouds {
  position: fixed;
  bottom: -160px;
  left: -230px;
  z-index: -10;
  width: 1920px;
}

.address-field {
  width: 50%;
}

.send-metacoin {
  display: flex;
  flex-direction: column;
}
```

## Kết quả
![](https://images.viblo.asia/93a55437-e326-4c79-97ae-65029927a91f.png)

Các bạn có thể tham khảo trong repo này :

https://github.com/vinhyenvodoi98/EthCoinBase-Angular
