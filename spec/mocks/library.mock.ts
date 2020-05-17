import { Observable } from "rxjs/Observable";
import { of } from "rxjs/observable/of";
// import { p } from '@angular/core/src/render3';
import { flatMap } from "rxjs/operators";
import {
  LegacyWalletV1,
  ImplicitAccount,
  OriginatedAccount,
  LegacyWalletV2,
  Activity,
  LegacyWalletV3,
  HdWallet,
} from "./../../src/app/services/wallet/wallet";
import { viewClassName } from "@angular/compiler";

/**
 * Kukai Extensible Mocking Tools
 */
export class Tools {
  /**
   * Generate Random Number
   * @param min
   * @param max
   * @param multiplier
   * @param fixed
   */
  generateRandomNumber(
    min: number,
    max: number,
    multiplier: number = 1,
    fixed: number = 0
  ): number {
    min = min * multiplier;
    max = max * multiplier;

    if (fixed) {
      return Number((Math.random() * (max - min) + min).toFixed(fixed));
    } else {
      return Math.floor(Math.random() * (max - min)) + min;
    }
  }

  /**
   * Generate Random String
   * @param length
   */
  generateRandomString(length: number, prefix: string = "") {
    let randString: string = prefix;
    const len: number = length - prefix.length;
    const charSet =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    // generate string for remaining non-prefix length
    for (let i = 0; i <= len; i++) {
      randString += charSet[Math.floor(Math.random() * charSet.length)];
    }
    return randString;
  }

  /**
   * Generate Random Date
   * @param start
   * @param end
   * @returns new Date()
   * Example: generateRandomDate('1999-01-01', '2017-12-07')
   */
  generateRandomDate(start, end): Date {
    //new Date('2011-04-11T10:20:30Z')
    start = new Date(start);
    end = new Date(end);
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  }

  /**
   * Balance Generator
   * @summary Randomly generate realistic balance
   * @returns number
   */
  generateBalance(xtzrate: number = 0.510272): number {
    // generate common transaction amount, use multiplier to adjust
    const balance = this.generateRandomNumber(1000, 7500, 1000000);

    return balance;
  }

  /**
   * Return Empty Balance
   */
  getEmptyBalance(): number {
    return null;
  }

  /**
   * Date Difference in Days
   * @param a
   * @param b
   */
  dateDiffInDays(a: Date, b: Date) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    if (a === b) {
      console.log("they are the same");
      return 0;
    } else {
      return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    }
  }

  printAccounts(implicitAccounts: ImplicitAccount[]): void {
    let string = "\n+--------------------------------------+\n";

    for (let impAcc of implicitAccounts) {
      const pkh = impAcc.pkh;
      const balance = (impAcc.balanceXTZ / 1000000).toFixed(2);
      const delegate = impAcc.delegate;
      const numberOfActivites = impAcc.activitiesCounter;

      string += "\x1b[36m"; //set blue
      string += "   public key hash: " + pkh + "\n";
      string += "\x1b[32m";
      string += "   delegate: " + delegate + "\n";
      string += "   balance: " + balance + "\n";
      string += "   counter: " + numberOfActivites + "";
      string += "\x1b[0m";
      string += "\n+--------------------------------------+\n";
      for (let origAcc of impAcc.originatedAccounts) {
        const pkh = origAcc.address;
        const balance = (origAcc.balanceXTZ / 1000000).toFixed(2);
        const delegate = origAcc.delegate;
        const numberOfActivites = origAcc.activitiesCounter;

        string += "\x1b[36m"; //set blue
        string += "   public key hash: " + pkh + "\n";
        string += "\x1b[32m";
        string += "   delegate: " + delegate + "\n";
        string += "   balance: " + balance + "\n";
        string += "   counter: " + numberOfActivites + "";
        string += "\x1b[0m";
        string += "\n+--------------------------------------+\n";
      }
    }
    console.log(string);
  }
  /**
	@param activities
	hash: string;
	block: string;
	source: string;
	destination: string;
	amount: number;
	fee: number;
	timestamp: null|Date;
	type: string;
	 */

  printActivities(activities: Activity[]): void {
    let string = "\n+--------------------------------------+\n";

    for (let i = 0; i < activities.length; i++) {
      const hash = activities[i].hash;
      const block = activities[i].block;
      const source = activities[i].source;
      const destination = activities[i].destination;
      const amount = activities[i].amount;
      const fee = activities[i].fee;
      const timestamp = activities[i].timestamp;
      const type = activities[i].type;

      string += "\x1b[36m"; //set blue
      string += "          hash: " + hash + "\n";
      string += "\x1b[32m";
      string += "         block: " + block + "\n";
      string += "        source: " + source + "\n";
      string += "   destination: " + destination + "\n";
      string += "        amount: " + amount + "\n";
      string += "           fee: " + fee + "\n";
      string += "     timestamp: " + timestamp + "\n";
      string += "          type: " + type + "\n";
      string += "\x1b[0m";
      string += "\n+--------------------------------------+\n";
    }
    console.log(string);
  }
}

/**
 * Kukai OperationMocking Library
 */
export class OperationTools extends Tools {
  getOp(data: any, pkh: string): any {
    const ops: any[] = [];
    for (let index = 0; index < data.type.operations.length; index++) {
      let type = "Unknown";
      if (data.type.operations[index].kind !== "reveal") {
        type = data.type.operations[index].kind;
        const failed = data.type.operations[index].failed;
        let destination = "";
        let source = "";
        let amount = 0;
        let fee = 0;
        if (type === "activation") {
          source = data.type.operations[index].pkh.tz;
        } else {
          source = data.type.source.tz;
          if (type === "transaction") {
            destination = data.type.operations[index].destination.tz;
            amount = data.type.operations[index].amount;
            if (destination !== pkh) {
              amount = amount * -1;
            }
            fee = data.type.fee;
          } else if (type === "origination") {
            destination = data.type.operations[index].tz1.tz;
            amount = data.type.operations[index].balance;
            if (destination !== pkh) {
              amount = amount * -1;
            }
            fee = data.type.fee;
          } else if (type === "delegation") {
            destination = data.type.operations[index].delegate;
            fee = data.type.fee;
          }
        }
        const op: any = {
          hash: data.hash,
          block: data.block_hash,
          source: source,
          destination: destination,
          amount: amount,
          fee: fee,
          timestamp: null,
          type: type,
          failed: failed,
        };
        ops.push(op);
      }
    }
    return ops;
  }
  getOperations() {
    // tslint:disable-next-line:max-line-length
    return [
      {
        hash: "oojyMokq8spYaDECQP9s43aCnMHGocdbYbPKvddaieQAZCS7H3s",
        block_hash: "BKmiYRBy7ZbLxZcN34JvKurMYt3s9RcAbcVVF6mTfE5Uo6G4Jtt",
        network_hash: "NetXdQprcVkpaWU",
        type: {
          kind: "manager",
          source: { tz: "tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt" },
          operations: [
            {
              kind: "transaction",
              src: { tz: "tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt" },
              amount: "889162032500",
              destination: { tz: "KT1VyvPxmo7GpSozfzen8UQLWBRwKjiF9JNa" },
              failed: false,
              internal: false,
              burn: 0,
              counter: 1389,
              fee: 2000,
              gas_limit: "10200",
              storage_limit: "0",
              op_level: 225011,
              timestamp: "2018-12-12T21:54:12Z",
            },
          ],
        },
      },
      {
        hash: "oo3LbVP5U4kzrAHKRSow6amejMkXHfwUuJ1wiuW1cwGJ5CKYBrd",
        block_hash: "BLZisMgE9cb7nf1yaEHB3QfU53uavjmJyC11DVto5gKmS6zrYe9",
        network_hash: "NetXdQprcVkpaWU",
        type: {
          kind: "manager",
          source: { tz: "tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt" },
          operations: [
            {
              kind: "transaction",
              src: { tz: "tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt" },
              amount: "26478863095",
              destination: { tz: "KT1HmGvNKp8GXgVk6YckUL1LY9h9itDTNXuA" },
              failed: false,
              internal: false,
              burn: 0,
              counter: 1388,
              fee: 2000,
              gas_limit: "10200",
              storage_limit: "0",
              op_level: 225010,
              timestamp: "2018-12-12T21:53:12Z",
            },
          ],
        },
      },
      {
        hash: "ooYri4TZk4wukWs8sWWFVVXZyxTiro1xbX5aZP1PfCKWqbLWcLx",
        block_hash: "BLtLNKqse6ceRkHC3jnS8z6bo7i7hw2RJJXxVsyacciebcJHYWA",
        network_hash: "NetXdQprcVkpaWU",
        type: {
          kind: "manager",
          source: { tz: "tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt" },
          operations: [
            {
              kind: "transaction",
              src: { tz: "tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt" },
              amount: "15991842036",
              destination: { tz: "KT1AcH3YscoUcJKqvqdcYCBeZwAennd2NEeN" },
              failed: false,
              internal: false,
              burn: 0,
              counter: 1387,
              fee: 2000,
              gas_limit: "10200",
              storage_limit: "0",
              op_level: 225009,
              timestamp: "2018-12-12T21:52:12Z",
            },
          ],
        },
      },
    ];
  }
}

/**
 * Kukai Activity Mocking Library
 */
export class ActivityTools extends OperationTools {
  /**
   * Generate Multiple Activities
   * @param number
   * @param source
   * @param type
   */
  generateActivities(number: number, source: string, type: string): Activity[] {
    // initialize empty Activity array
    const activities: Activity[] = [];

    // generate unique hashes for { number } of activities
    for (let i = 0; i < number; i++) {
      // generated hashes
      let ophash: string;
      let blockhash: string;

      // boolean checks it is unique
      let ophash_verified = false;
      let blockhash_verified = false;

      // check to exit condition
      let unique: boolean;

      // generate a unique operation hash
      while (!ophash_verified) {
        unique = true;
        ophash = this.generateOperationHash();

        // check against existing ophash set
        for (let x = 0; x < activities.length; x++) {
          if (ophash === activities[x].hash) {
            unique = false;
          }
        }

        // verify if property is not used in set
        if (unique) {
          ophash_verified = true;
        }
      }

      // generate unique block hash
      while (!blockhash_verified) {
        unique = true;
        blockhash = this.generateBlockHash();

        // check against existing blockhash set
        for (let x = 0; x < activities.length; x++) {
          if (blockhash === activities[x].block) {
            unique = false;
          }
        }

        // verify if property is not used in set
        if (unique) {
          blockhash_verified = true;
        }
      }

      activities.push(this.generateActivity(ophash, blockhash, source, type));
    }
    return activities;
  }

  /**
   * Generate Activity
   * @param operationhash
   * @param blockhash
   * @param source
   * @param type
   */
  generateActivity(
    operationhash: string,
    blockhash: string,
    source: string,
    type: string
  ): Activity {
    // generate a mock activity
    const activity: Activity = {
      hash: operationhash,
      block: blockhash,
      source: source,
      destination: this.generateDestination(),
      amount: this.generateAmount(),
      fee: this.generateFee(),
      timestamp: this.generateDate().toString(),
      type: type,
      failed: false
    };

    return activity;
  }

  /**
   * Generate Operation Hash
   */
  generateOperationHash(): string {
    return this.generateRandomString(51, "oo");
  }

  /**
   * Generate Block Hash
   */
  generateBlockHash(): string {
    return this.generateRandomString(51, "BL");
  }

  /**
   * Generate Destination Address
   * @summary Returns random entry from alphanet account map
   * @returns string
   */
  generateDestination(): string {
    const implicitAddresses = [
      "tz1eSeLtoZwbi6hCbepRcsoQiLzTaeAMK59J",
      "tz1PvVPHCtyvwrpLKoCFBXbiPh3DwmiFFKnQ",
      "tz1hgWvYdzLECdrq5zndGHwCGnUCJq1KFe3r",
      "tz1Vrs3r11Tu9fZvu4mHFcuNt9FK9QuCw83X",
      "tz1isdcry1fivqoXbFArYjP7nhFU1watadyC",
      "tz1SjiQ2fApoJB6VWxMa6nha3GwCPw4266AZ",
      "tz1YsbingXMmDqaXiTSccV8CgavdATeXeNF1",
      "tz2L2HuhaaSnf6ShEDdhTEAr5jGPWPNwpvcB",
      "tz1bsHJBTfGBbPvG48rN6ryiHDzBustQ9gtZ",
      "tz1bhk6jHswCTggueGfYCNfuQ5pneRMzaPbm",
      "tz1hhFd3KyjWAwAR718GVfTHUtCND6LZdLjC",
      "tz1XD4TuLXVjtpaE14B3ZJ2cjfp4Kzbpdqs1",
      "tz1VAckrTCDiJcYALzjdW56NTVDmxrgJyrVn",
      "tz1ciwpCgVCcJ7eWgqhzJe4yKQqPH1Yj3NTM",
      "tz1YZvSSCi6fjgtTxTDAvKuSvdBHQw2dbXZu",
      "tz1N2huAR4LaZyac7cCR7ZNaJCkEDhuTmetU",
      "tz1fX1eDSwSCC2SEyCAVyFbrgpGkLBpjDSFR",
      "tz1QYqcPtcYLTcH7Bz2BNy7B4N6eWgAX93CC",
      "tz1ZL6qHzJz3NTXHApWJRXoByFxL6R38KvFb",
    ];
    return implicitAddresses[this.generateRandomNumber(0, 19)];
  }

  /**
   * Amount Generator
   * @summary Randomly generate realistic transaction operation amount
   * @returns number
   */
  generateAmount(): number {
    // generate common transaction amount, use multiplier to adjust
    return this.generateRandomNumber(1000, 7500, 1000000);
  }

  /**
   * Fee Generator
   * @summary Randomly generate realistic operation fee amount
   * @returns number fixed (4)
   */
  generateFee(): number {
    // generate realistic fee amount between 0.0025-0.0035 XTZ
    return this.generateRandomNumber(0.0025, 0.0035, 1, 4);
  }

  /**
   * Timestamp Generator
   * @summary Returns random datetime between two dates
   * @retuns Date
   */
  generateDate(): Date {
    return this.generateRandomDate(
      "2018-07-01T00:00:00Z",
      "2019-01-04T00:00:00Z"
    );
  }
}

/**
 * Kukai Account Mocking Library
 */
export class AccountTools extends ActivityTools {
  generateAccount(
    pkh: string,
    pk: string,
    xtzrate: number = 0.510272,
    balance: number = this.getEmptyBalance()
  ): ImplicitAccount {
    return <ImplicitAccount> {
      pkh: pkh,
      pk: pk,
      delegate: this.generateRandomDelegate(),
      balanceXTZ: this.generateBalance(xtzrate),
      balanceUSD: 0,
      activitiesCounter: 5,
      activities: this.generateActivities(5, pkh, "transaction"),
      originatedAccounts: []
    };
  }

  generateAccounts(pkh: string[], pk: string[], activities: Activity[][] = []): ImplicitAccount[] {
    const accounts: ImplicitAccount[] = [];

    for (let i = 0; i < pkh.length; i++) {
      accounts.push(
        this.generateAccount(pkh[i], pk[i], 0.510272, this.generateBalance())
      );
    }
    return accounts;
  }
  generateRandomDelegate(): string {
    const x = this.generateRandomNumber(0, 5);

    const delegates = [
      "",
      "tz1eEnQhbwf6trb8Q8mPb2RaPkNk2rN7BKi8",
      "tz1abTjX2tjtMdaq5VCzkDtBnMSCFPW2oRPa",
      "tz1NortRftucvAkD1J58L32EhSVrQEWJCEnB",
      "tz1bHzftcTKZMTZgLLtnrXydCm6UEqf4ivca",
      "tz1LLNkQK4UQV6QcFShiXJ2vT2ELw449MzAA",
    ];

    return delegates[x];
  }
}

/**
 * Kukai Wallet Mocking Library
 */
export class WalletTools extends AccountTools {

  // @todo move to pipe, network service, etc.
  getTickerRate(symbol: string, basepair: string): number {
    if (symbol === "xtz" && basepair === "usd") {
      return 0.510272;
    }
  }

  // @todo move to pipe, network service, etc.
  getUSDRate(symbol: string, qty: number): number {
    if (symbol === "xtz") {
      const conversion = qty / 1000000;
      return conversion * this.getTickerRate("xtz", "usd");
    }
  }

  getWalletBalance(implicitAccounts: ImplicitAccount[]): any {
    let totalbalance = 0;

    if (implicitAccounts.length) {
      for (let i = 0; i < implicitAccounts.length; i++) {
        const balance = implicitAccounts[i].balanceXTZ;
        if (balance != null) {
          totalbalance += balance;
        }
      }

      return {
        balanceXTZ: totalbalance,
        balanceUSD: this.getUSDRate("xtz", totalbalance),
      };
    } else {
      return this.getEmptyBalance();
    }
  }
  /**
   * Generate Wallet
   * @param seed
   * @param type
   * @param accountpkhs
   * @param xtzrate
   * @param balance
   */
  // tslint:disable-next-line:max-line-length
  generateWalletV1(
    seed: string = "224e6376f4b25825f8110b896c81b74895451d8c19ba09ee3a2552a2550fcf88",
    implicitAccount: any = {
      pk: "edpktuKnjXvtFnpEjz85Fm8712wV2xvd2SjsLPk1v6dDQZa8ZqgaWf",
      pkh: "tz1U2R9zKaKW6EjngeLU4LPitck5koJHT5Xb",
    },
    originatedAccounts: string[] = [
      "KT1EyxYE9TWEVSvUktBMErqKfNxGEomTdoaf",
      "KT1TZeMxMUHeLM4SvbcsvdpAG2KRHUYV7fiT",
    ],
    xtzrate: number = 0.510272,
    balance: number = 100
  ): LegacyWalletV1 {
    const v1wallet = new LegacyWalletV1("U2R9zKaKW6EjngeL", seed);
    v1wallet.XTZrate = xtzrate;
    v1wallet.implicitAccounts.push(
      new ImplicitAccount(implicitAccount.pkh, implicitAccount.pk)
    );
    v1wallet.implicitAccounts[0].balanceXTZ = balance;
    for (let origAcc of originatedAccounts) {
      v1wallet.implicitAccounts[0].originatedAccounts.push(
        new OriginatedAccount(origAcc, implicitAccount.pkh, implicitAccount.pk)
      );
      v1wallet.implicitAccounts[0].originatedAccounts[
        v1wallet.implicitAccounts[0].originatedAccounts.length - 1
      ].balanceXTZ = balance;
    }
    const { balanceXTZ, balanceUSD } = this.getWalletBalance(
      v1wallet.implicitAccounts
    );
    v1wallet.totalBalanceXTZ = balanceXTZ;
    v1wallet.totalBalanceUSD = balanceUSD;
    return v1wallet;
  }

  /**
   * Generate Wallet v2
   * @param seed
   * @param type
   * @param accountpkhs
   * @param xtzrate
   * @param balance
   *
   * @todo create actual password encrypted wallet
   */
  // tslint:disable-next-line:max-line-length
  generateWalletV2(
    seed: string = "3f5ec27d8efc83a8c6ca6ba22b0e4f179cfe2381f12fda4672f571a07d4b89e2==508e35d6b94f018eeec18d12a9337341",
    implicitAccount: any = {
      pk:
        "edpku7vd7gzLzeTwdo21VC97Vp23rTjpyAZxdXTWNWi66puhPuBRLe, pkh: tz1NUXpLwA9Jj5hXHZanYCV1pMNycxXx6zAf",
    },
    originatedAccounts: string[] = [
      "KT18e6uHg65SZUF2Gkh8GU2RRDaHm3VGfLhF",
      "KT1LmKuo4GwJeRLtrZcdX2sSQyHAPZUHSb9T",
    ],
    xtzrate: number = 0.510272,
    balance: number = 100
  ): LegacyWalletV2 {
    const v2wallet = new LegacyWalletV2(
      "ce7738762322795aca89a178a5db915e",
      seed
    );
    v2wallet.XTZrate = xtzrate;
    v2wallet.implicitAccounts.push(
      new ImplicitAccount(implicitAccount.pkh, implicitAccount.pk)
    );
    v2wallet.implicitAccounts[0].balanceXTZ = balance;
    for (let origAcc of originatedAccounts) {
      v2wallet.implicitAccounts[0].originatedAccounts.push(
        new OriginatedAccount(origAcc, implicitAccount.pkh, implicitAccount.pk)
      );
      v2wallet.implicitAccounts[0].originatedAccounts[
        v2wallet.implicitAccounts[0].originatedAccounts.length - 1
      ].balanceXTZ = balance;
    }
    const { balanceXTZ, balanceUSD } = this.getWalletBalance(
      v2wallet.implicitAccounts
    );
    v2wallet.totalBalanceXTZ = balanceXTZ;
    v2wallet.totalBalanceUSD = balanceUSD;
    return v2wallet;
  }
  // icon salute dinner depend radio announce urge hello danger join long toe ridge clever toast opera spot rib outside explain mixture eyebrow brother share
  generateHdWallet(
    iv: string = "aff0bfd4ccdab8ae3e35eeab9e7af782",
    encryptedSeed: string = "90f57ef8f82e9acfa11a44e02aefaa8444596c3a8d2aa2aeaecfbb51187484a0354bf8a6c009bb4836716dc030d790978948044454dd85e6e2f2fb6284ac2c50==a533b34b90fcf71742a0d6abc9eaed15",
    encryptedEntropy: string = "8178b31d4c23c4e07f2fdc024966a76ca7630c4607018847a3aec315a765e17b==5d0c16c5f2207409f67f259110b9ca93",
    implicitAccounts: any = [{
      pk: "edpkvXyJHwuFRkngpcPyYWndZhAqf72owWrMnkkNsBoBkS54V4GJrM", pkh: "tz1TogVQurVUhTFY1d62QJGmkMdEadM9MNpu",
    },{
      pk: "edpkvaNoKcTrQ8jBVHkVUzwZnLAaZT98ALxucqcfmkPAWGXuRVM9Db", pkh: "tz1dXCZTs4pRTVvoXJXNRUmrYqtCde4fdP8N"
    }],
    xtzrate: number = 0.510272,
    balance: number = 100
  ): HdWallet {
    const hdWallet = new HdWallet(
      iv,
      encryptedSeed,
      encryptedEntropy
    );
    hdWallet.XTZrate = xtzrate;
    for (let impAcc of implicitAccounts) {
    hdWallet.implicitAccounts.push(
      new ImplicitAccount(impAcc.pkh, impAcc.pk)
    );
    hdWallet.implicitAccounts[hdWallet.implicitAccounts.length - 1].balanceXTZ = balance;
  }
    const { balanceXTZ, balanceUSD } = this.getWalletBalance(
      hdWallet.implicitAccounts
    );
    hdWallet.totalBalanceXTZ = balanceXTZ;
    hdWallet.totalBalanceUSD = balanceUSD;
    return hdWallet;
  }
}
