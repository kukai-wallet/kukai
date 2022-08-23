import { EventEmitter, Input, Output, SimpleChanges, Component, OnInit, OnChanges } from '@angular/core';
import { LoginConfig, TypeOfLogin, LoginPrio } from 'kukai-embed';
import { WalletService } from '../../../../services/wallet/wallet.service';
import { MessageService } from '../../../../services/message/message.service';
import { TorusService } from '../../../../services/torus/torus.service';
import { EmbeddedTorusWallet } from '../../../../services/wallet/wallet';
import { CONSTANTS } from '../../../../../environments/environment';
import { SubjectService } from '../../../../services/subject/subject.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit, OnChanges {
  constructor(
    private messageService: MessageService,
    public torusService: TorusService,
    private walletService: WalletService,
    private subjectService: SubjectService
  ) {}
  @Input() dismiss: Boolean;
  @Input() loginConfig: LoginConfig;
  @Output() loginResponse = new EventEmitter();
  loginOptions = [];
  queueTime: number = 0;
  queueTimeVisible: number = 0;
  queueLen = 0;
  queueLenInterval: any;
  statusCounter: number = 0;
  queueInterval: NodeJS.Timeout;
  readonly queueEndpoint = 'https://q.tcinfra.net/rpc';
  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.loginConfig) {
      if (this.loginConfig?.customPrio === 'low') this.queueLen = 0;
      this.queueLenInterval = setInterval(async () => {
        this.queueLen = await this.getQueueLen();
        console.log('Queue length (s)', this.queueLen);
      }, 5000);
      this.getQueueLen().then((res) => {
        this.queueLen = res;
        console.log('Queue length (s)', this.queueLen);
      });
    }
    if (changes?.dismiss?.currentValue === true) {
      this.messageService.stopSpinner().then(() => this.loginResponse.emit('dismiss'));
    }
    if (changes?.loginConfig?.currentValue) {
      if (this.loginConfig.customPrio === 'high') {
        if (this.walletService.wallet && this.walletService.wallet instanceof EmbeddedTorusWallet) {
          if (this.walletService.wallet?.verifier) {
            this.loginConfig.loginOptions = [this.walletService.wallet.verifier as TypeOfLogin];
          }
          this.startQueue();
        }
      }
      if (this.loginConfig.loginOptions?.length > 0) {
        this.loginOptions = [];
        for (const loginOption of this.loginConfig.loginOptions) {
          if (this.torusService.verifierMapKeys.includes(loginOption)) {
            this.loginOptions.push(loginOption);
          }
        }
      } else {
        this.loginOptions = this.torusService.verifierMapKeys;
      }
    }
  }
  async startQueue() {
    // set high prio
    if (this.walletService.wallet instanceof EmbeddedTorusWallet) {
      this.queueTime = -1;
      this.setHighPrio(this.walletService.wallet.verifier, this.walletService.wallet.id);
    }
    this.queueTimeVisible = -1;
    this.messageService.startSpinner();
    this.queueInterval = setInterval(() => {
      if (this.queueTimeVisible > 1 || (this.queueTimeVisible === 1 && this.queueTime === 0)) {
        this.queueTimeVisible -= 1;
      }
      if (this.walletService.wallet instanceof EmbeddedTorusWallet) {
        let timeBetweenChecks = 300;
        if (this.queueTimeVisible < 4) {
          timeBetweenChecks = 2;
        } else if (this.queueTimeVisible < 60) {
          timeBetweenChecks = 15;
        } else if (this.queueTimeVisible < 1800) {
          timeBetweenChecks = 60;
        }
        this.statusCounter = ++this.statusCounter % timeBetweenChecks;
        if (this.statusCounter === 0) {
          this.checkQueue(this.walletService.wallet.verifier, this.walletService.wallet.id);
        }
      }
      if (this.queueTimeVisible <= 0 && this.queueTime === 0) {
        this.stopQueue();
      }
    }, 1000);
  }
  stopQueue() {
    if (this.queueInterval) {
      clearInterval(this.queueInterval);
    }
    if (this.queueLenInterval) {
      clearInterval(this.queueLenInterval);
    }
    this.queueTime = 0;
    this.queueTimeVisible = 0;
    this.queueLen = 0;
    this.statusCounter = 0;
    this.messageService.stopSpinner();
  }
  abort() {
    this.loginResponse.emit(null);
    this.stopQueue();
  }
  async login(typeOfLogin: string) {
    try {
      this.messageService.startSpinner('Loading wallet...');
      let loginData;
      const len: number = this.queueLen;
      if (this.loginConfig?.customPrio === LoginPrio.Low) {
        loginData = await this.torusService.loginTorus(typeOfLogin, '', len > 5);
      } else if (this.loginConfig?.customPrio === LoginPrio.High && this.walletService.wallet instanceof EmbeddedTorusWallet) {
        loginData = await this.torusService.loginTorus(typeOfLogin, this.walletService.wallet.id);
      } else {
        loginData = await this.torusService.loginTorus(typeOfLogin);
      }
      if (!loginData?.keyPair) {
        throw new Error('Login failed');
      }
      if (this.loginConfig?.customPrio === LoginPrio.Low) {
        // loginData.keyPair = { pk: '', pkh: '' };
        if (loginData?.keyPair?.pk === '') {
          this.setLowPrio(loginData.userInfo);
        } else {
          if (len > 5) {
            this.skipQueue(loginData.userInfo.typeOfLogin, loginData.userInfo.verifierId, loginData.keyPair.pkh);
          } else {
            this.setLowPrio(loginData.userInfo);
          }
        }
      }
      if (this.dismiss === null) {
        await this.messageService.stopSpinner();
      }
      this.loginResponse.emit(loginData);
      this.stopQueue();
    } catch {
      await this.messageService.stopSpinner();
    }
  }
  async setLowPrio(userInfo: any) {
    let { typeOfLogin, verifierId } = userInfo;
    const res = await this.post(this.queueEndpoint, {
      action: 'add_low_priority',
      network: CONSTANTS.MAINNET ? 'mainnet' : 'testnet',
      verifier: typeOfLogin,
      identity: verifierId,
      groups: [CONSTANTS.NETWORK, this.subjectService.origin?.value]
    });
    console.log('setLowPrio', res);
    return res;
  }
  async setHighPrio(typeOfLogin: string, verifierId: string) {
    const res = await this.post(this.queueEndpoint, {
      action: 'add_high_priority',
      network: CONSTANTS.MAINNET ? 'mainnet' : 'testnet',
      verifier: typeOfLogin,
      identity: verifierId,
      groups: [CONSTANTS.NETWORK, this.subjectService.origin?.value]
    });
    console.log('setHighPrio', res);
    this.updateQueue(res);
    return res;
  }
  async checkQueue(typeOfLogin: string, verifierId: string) {
    const res = await this.post(
      this.queueEndpoint,
      {
        action: 'fetch',
        network: CONSTANTS.MAINNET ? 'mainnet' : 'testnet',
        verifier: typeOfLogin,
        identity: verifierId
      },
      0
    );
    console.log('checkQueue', res);
    this.updateQueue(res);
    return res;
  }
  async skipQueue(typeOfLogin: string, verifierId: string, pkh: string) {
    const res = await this.post(this.queueEndpoint, {
      action: 'report',
      network: CONSTANTS.MAINNET ? 'mainnet' : 'testnet',
      verifier: typeOfLogin,
      identity: verifierId,
      groups: [CONSTANTS.NETWORK, this.subjectService.origin?.value],
      metadata: { pkh }
    });
    console.log('skipQueue', res);
    return res;
  }
  updateQueue(res: any) {
    if (res?.EstimatedTimeSeconds !== -1) {
      if (res.EstimatedTimeSeconds === 0 && res.Status === 'error') {
        console.error('FailedToResolve');
        this.abort();
        return;
      }
      if (this.queueTimeVisible === -1) {
        this.messageService.stopSpinner();
      }
      this.queueTime = this.queueTimeVisible = res.EstimatedTimeSeconds;
    }
  }
  async getQueueLen(): Promise<number> {
    const res = await this.post(this.queueEndpoint, {
      action: 'len'
    });
    return Number(res.EstimatedTimeSeconds);
  }
  async get(url: string, triesLeft = 3) {
    return await fetch(url)
      .then(async (res) => {
        return await res.json();
      })
      .catch(async (e) => {
        if (triesLeft > 0) {
          return await this.get(url, --triesLeft);
        } else {
          throw e;
        }
      });
  }
  async post(url: string, body: any, triesLeft = 3) {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(body)
    })
      .then(async (res) => {
        return await res.json();
      })
      .catch(async (e) => {
        if (triesLeft > 0) {
          return await this.post(url, body, --triesLeft);
        } else {
          throw e;
        }
      });
  }
}
