import { Component, OnInit } from '@angular/core';
import { TorusService } from '../../services/torus/torus.service';
import { CONSTANTS } from '../../../environments/environment';
import { ImportService } from '../../services/import/import.service';
import { KeyPair } from '../../interfaces';
import { WalletService } from '../../services/wallet/wallet.service';
import { PartialTezosTransactionOperation, TezosOperationType } from '@airgap/beacon-sdk';
import { EmbeddedTorusWallet, ImplicitAccount, TorusWallet } from '../../services/wallet/wallet';
import { CoordinatorService } from '../../services/coordinator/coordinator.service';

@Component({
  selector: 'app-embedded',
  templateUrl: './embedded.component.html',
  styleUrls: ['./embedded.component.scss']
})
export class EmbeddedComponent implements OnInit {
  allowedOrigins = ['http://localhost', 'https://www.tezos.help'];
  origin = '';
  login = false;
  activeAccount: ImplicitAccount = null;
  operationRequest = null;
  constructor(
    private torusService: TorusService,
    private importService: ImportService,
    private walletService: WalletService,
    private coordinatorService: CoordinatorService
  ) { }

  ngOnInit(): void {
    document.body.style.background = 'none';
    this.torusService.initTorus();
    if (window.addEventListener) {
      window.addEventListener('message', this.handleRequest, false);
    } else {
      (window as any).attachEvent('onmessage', this.handleRequest);
    }
    console.log('icabod is connected...');
    if (this.walletService.wallet && this.walletService.wallet instanceof EmbeddedTorusWallet) {
      this.activeAccount = this.walletService.wallet.implicitAccounts[0];
    }
  }
  handleRequest = (evt) => {
    try {
      const data = JSON.parse(evt.data);
      if (this.allowedOrigins.includes(evt.origin)) {
        console.log(`Received ${evt.data} from ${evt.origin}`);
        if (data && data.request && data.network === CONSTANTS.NETWORK && /* restricted to dev enviroment for now */ !CONSTANTS.MAINNET) {
          this.origin = evt.origin;
          switch (data.request) {
            case 'login':
              this.login = true;
              break;
            case 'send':
              if (this.walletService.wallet instanceof EmbeddedTorusWallet && evt.origin === this.walletService.wallet.origin) {
                this.operationRequest = this.beaconAdapter('tz1NBvY7qUedReRcYx8gqV34c8fUuks8o8Nr', '10000');
              }
              break;
            default:
              console.warn('Unknown request');
          }
        }
      } else if (data && data.request) {
        console.log(`Invalid origin (${evt.origin})`);
      }
    } catch {}
  }
  loginResponse(loginData: any) {
    if (loginData) {
      const { keyPair, userInfo } = loginData;
      const response = JSON.stringify({
        // userInfo
        response: 'login',
        pk: keyPair.pk,
        pkh: keyPair.pkh
      });
      window.parent.window.postMessage(response, this.origin);
      this.importAccount(keyPair, userInfo);
    } else {
      this.abort();
    }
    this.login = false;
  }
  abort() {
    const msg = JSON.stringify({ response: 'login', failed: true, error: 'ABORTED_BY_USER' });
    window.parent.window.postMessage(msg, this.origin);
  }
  operationResponse(opHash: string) {
    this.operationRequest = null;
    const msg = opHash ?
      JSON.stringify({ response: 'send', opHash }) :
      JSON.stringify({ response: 'send', failed: true, error: 'ABORTED_BY_USER' });
    window.parent.window.postMessage(msg, this.origin);
  }
  private async importAccount(keyPair: KeyPair, userInfo: any) {
    if (keyPair) {
      await this.importService
        .importWalletFromPk(keyPair.pk, '', { verifier: userInfo.typeOfLogin, id: userInfo.verifierId, name: userInfo.name, embedded: true, origin: this.origin }, keyPair.sk)
        .then((success: boolean) => {
          if (success) {
            console.log('success');
            this.activeAccount = this.walletService.wallet.implicitAccounts[0];
            // should disable the message component in headless mode
            this.coordinatorService.startAll();
          }
        });
    }
  }
  private beaconAdapter(destination: string, amount: string) {
    const transaction: PartialTezosTransactionOperation = {
      kind: TezosOperationType.TRANSACTION,
      amount,
      destination,
    }
    return { operationDetails: [transaction] };
  }
}
