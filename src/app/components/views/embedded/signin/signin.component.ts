import { EventEmitter, Input, Output, SimpleChanges, Component, OnInit, OnChanges } from '@angular/core';
import { LoginConfig, TypeOfLogin, LoginPrio } from 'kukai-embed';
import { WalletService } from '../../../../services/wallet/wallet.service';
import { MessageService } from '../../../../services/message/message.service';
import { TorusService } from '../../../../services/torus/torus.service';
import { EmbeddedTorusWallet } from '../../../../services/wallet/wallet';
import { CONSTANTS } from '../../../../../environments/environment';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['../../../../../scss/components/views/embedded/signin/signin.component.scss']
})
export class SigninComponent implements OnInit, OnChanges {
  constructor(
    private messageService: MessageService,
    public torusService: TorusService,
    private walletService: WalletService
  ) { }
  @Input() dismiss: Boolean;
  @Input() loginConfig: LoginConfig;
  @Output() loginResponse = new EventEmitter();
  loginOptions = [];
  queueTime: number = 0;
  queueTimeVisible: number = 0;
  statusCounter: number = 0;
  queueInterval: NodeJS.Timeout;
  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
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
      await this.setHighPrio(this.walletService.wallet.verifier, this.walletService.wallet.id);
    }
    this.queueTimeVisible = -1;
    this.queueInterval = setInterval(() => {
      if (this.queueTimeVisible > 1 || (this.queueTimeVisible === 1 && this.queueTime === 0)) {
        this.queueTimeVisible -= 1;
      }
      if (this.walletService.wallet instanceof EmbeddedTorusWallet) {
        let timeBetweenChecks = 60;
        if (this.queueTimeVisible < 10) {
          timeBetweenChecks = 2;
        } else if (this.queueTimeVisible < 60) {
          timeBetweenChecks = 5;
        }
        this.statusCounter = ++this.statusCounter % timeBetweenChecks;
        if (this.statusCounter === 0) {
          this.checkQueue(this.walletService.wallet.verifier, this.walletService.wallet.id);
        }
      }
      if (this.queueTimeVisible <= 0 && this.queueTime === 0) {
        this.stopQueue();
      }
    }, 1000)
  }
  stopQueue() {
    this.queueTimeVisible = 0;
    this.queueTimeVisible = 0;
    this.statusCounter = 0;
    if (this.queueInterval) {
      clearInterval(this.queueInterval);
    }
  }
  abort() {
    this.loginResponse.emit(null);
    this.stopQueue();
  }
  async login(typeOfLogin: string) {
    try {
      this.messageService.startSpinner('Loading wallet...');
      let loginData;
      if (this.loginConfig?.customPrio === LoginPrio.Low) {
        loginData = await this.torusService.loginTorus(typeOfLogin, '', true);
      } else if (this.loginConfig?.customPrio === LoginPrio.High && this.walletService.wallet instanceof EmbeddedTorusWallet) {
        loginData = await this.torusService.loginTorus(typeOfLogin, this.walletService.wallet.id);
      } else {
        loginData = await this.torusService.loginTorus(typeOfLogin);
      }
      if (!loginData?.keyPair) {
        throw new Error('Login failed');
      }
      if (this.loginConfig?.customPrio === LoginPrio.Low) {
        //loginData.keyPair = {pk: '', pkh: ''};
        if (loginData?.keyPair?.pk === '') {
          this.setLowPrio(loginData.userInfo);
        } else {
          console.log('skipping queue');
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
    if (!CONSTANTS.MAINNET) {
      typeOfLogin = 'mock';
    }
    const res = await this.get(`https://queue.tcinfra.net/q/low_priority?authorizer=${typeOfLogin}&id=${verifierId}`);
    console.log('setLowPrio', res);
    return res;
  }
  async setHighPrio(typeOfLogin: string, verifierId: string) {
    if (!CONSTANTS.MAINNET) {
      typeOfLogin = 'mock';
    }
    const res = await this.get(`https://queue.tcinfra.net/q/high_priority?authorizer=${typeOfLogin}&id=${verifierId}`);
    console.log('setHighPrio', res);
    this.updateQueue(res);
    return res;
  }
  async checkQueue(typeOfLogin: string, verifierId: string) {
    if (!CONSTANTS.MAINNET) {
      typeOfLogin = 'mock';
    }
    const res = await this.get(`https://queue.tcinfra.net/check?authorizer=${typeOfLogin}&id=${verifierId}`, 0);
    console.log('checkQueue', res);
    this.updateQueue(res);
    return res;
  }
  updateQueue(res: any) {
    if (res?.EstimatedTimeSeconds !== -1) {
      if (res.EstimatedTimeSeconds === 0 && res.Status === 'error') {
        console.error('FailedToResolve');
        this.abort()
        return;
      }
      this.queueTime = this.queueTimeVisible = res.EstimatedTimeSeconds;
    }
  }
  async get(url: string, triesLeft = 3) {
    return await fetch(url).then(async res => {
      return await res.json();
    }).catch(async e => {
      if (triesLeft > 0) {
        return await this.get(url, --triesLeft);
      } else {
        throw e;
      }
    });
  }
}
