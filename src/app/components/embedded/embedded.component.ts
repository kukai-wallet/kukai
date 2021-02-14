import { Component, OnInit } from '@angular/core';
import { TorusService } from '../../services/torus/torus.service';
import { CONSTANTS } from '../../../environments/environment';
import { ImportService } from '../../services/import/import.service';
import { KeyPair } from '../../interfaces';
import { WalletService } from '../../services/wallet/wallet.service';
import { PartialTezosTransactionOperation, TezosOperationType } from '@airgap/beacon-sdk';
import { EmbeddedTorusWallet, ImplicitAccount, TorusWallet } from '../../services/wallet/wallet';
import { CoordinatorService } from '../../services/coordinator/coordinator.service';

// TODO should the OperationsService be used instead of this dependancy??
import * as Bs58check from 'bs58check';

// could use literals instead of an enum
export enum MessageTypes {
  loginRequest = 'login_request',
  loginResponse = 'login_response',
  operationRequest = 'operation_request',
  operationResponse = 'operation_response',
  logoutRequest = 'logout_request',
  logoutResponse = 'logout_response'
}

export type LoginRequest = {
  type: MessageTypes.loginRequest,
  network: string
}

export type LoginResponse = {
  type: MessageTypes.loginResponse,
  instanceId: string,
  pk: string,
  pkh: string,
  userData: {
    typeOfLogin: string,
    id: string
  }
}

export type OperationRequest = {
  type: MessageTypes.operationRequest,
  network: string,
  operations: PartialTezosTransactionOperation[]
}

export type OperationResponse = {
  type: MessageTypes.operationResponse,
  opHash: string
}

export type LogoutRequest = {
  type: MessageTypes.logoutRequest,
  network: string
}

export type LogoutResponse = {
  type: MessageTypes.logoutResponse,
  instanceId: string
}

export type RequestMessage =
  LoginRequest |
  OperationRequest |
  LogoutRequest

export type ResponseMessage =
  LoginResponse |
  OperationResponse |
  LogoutResponse
  

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
      const data: RequestMessage = JSON.parse(evt.data);
      if (this.allowedOrigins.includes(evt.origin)) {
        console.log(`Received ${evt.data} from ${evt.origin}`);
        if (data && data.type && data.network === CONSTANTS.NETWORK && /* restricted to dev enviroment for now */ !CONSTANTS.MAINNET) {
          this.origin = evt.origin;
          switch (data.type) {
            case MessageTypes.loginRequest:
              this.login = true;
              break;
            case MessageTypes.operationRequest:
              // TODO make this work for the full array of operations
              if (this.walletService.wallet instanceof EmbeddedTorusWallet && evt.origin === this.walletService.wallet.origin &&
                data.operations[0] && data.operations[0].destination && data.operations[0].amount) {
                this.operationRequest = this.beaconAdapter(data.operations[0].destination, data.operations[0].amount);
              }
              break;
            default:
              console.warn('Unknown request');
          }
        }
      } else if (data && data.type) {
        console.log(`Invalid origin (${evt.origin})`);
      }
    } catch { }
  }
  loginResponse(loginData: any) {
    if (loginData) {
      const { keyPair, userInfo } = loginData;
      const response = JSON.stringify({
        type: MessageTypes.loginResponse,
        // 128 bits of entropy, base58 encoded
        // TODO should the OperationsService be used instead of this dependancy??
        instanceId: Bs58check.encode(Buffer.from(window.crypto.getRandomValues(new Uint8Array(16)))),
        pk: keyPair.pk,
        pkh: keyPair.pkh,
        userData: userInfo
      });
      window.parent.window.postMessage(response, this.origin);
      this.importAccount(keyPair, userInfo);
    } else {
      this.abort();
    }
    this.login = false;
  }
  abort() {
    // TODO type the failure message type properly
    const msg = JSON.stringify({ type: MessageTypes.loginResponse, failed: true, error: 'ABORTED_BY_USER' });
    window.parent.window.postMessage(msg, this.origin);
  }
  operationResponse(opHash: string) {
    this.operationRequest = null;
    const msg = opHash ?
      JSON.stringify({ type: MessageTypes.operationResponse, opHash }) :
      // TODO type the failure message type properly
      JSON.stringify({ type: MessageTypes.operationResponse, failed: true, error: 'ABORTED_BY_USER' });
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
      destination
      // add parameters here
    }
    return { operationDetails: [transaction] };
  }
}
