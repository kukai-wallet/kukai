import { Component, OnInit } from '@angular/core';
import { TorusService } from '../../services/torus/torus.service';
import { CONSTANTS } from '../../../environments/environment';
import { ImportService } from '../../services/import/import.service';
import { KeyPair } from '../../interfaces';
import { WalletService } from '../../services/wallet/wallet.service';
import { PartialTezosTransactionOperation, TezosOperationType } from '@airgap/beacon-sdk';
import { EmbeddedTorusWallet, ImplicitAccount, TorusWallet } from '../../services/wallet/wallet';
import { CoordinatorService } from '../../services/coordinator/coordinator.service';
import { utils, common } from '@tezos-core-tools/crypto-utils';
import { ActivatedRoute } from '@angular/router';
import { LookupService } from '../../services/lookup/lookup.service';

// could use literals instead of an enum
export enum MessageTypes {
  loginRequest = 'login_request',
  loginResponse = 'login_response',
  operationRequest = 'operation_request',
  operationResponse = 'operation_response',
  logoutRequest = 'logout_request',
  logoutResponse = 'logout_response'
}

export interface Failure {
  failed: true;
  error: string;
}

export interface LoginRequest {
  type: MessageTypes.loginRequest;
}

export type LoginResponse = {
  type: MessageTypes.loginResponse
} & ({
  instanceId: string,
  pk: string,
  pkh: string,
  userData: {
    typeOfLogin: string,
    id: string
  }
} | Failure);

export interface OperationRequest {
  type: MessageTypes.operationRequest;
  operations: PartialTezosTransactionOperation[];
}

export type OperationResponse = {
  type: MessageTypes.operationResponse
} & ({
  opHash: string
} | Failure);

export interface LogoutRequest {
  type: MessageTypes.logoutRequest;
}

export type LogoutResponse = {
  type: MessageTypes.logoutResponse
} & ({
  instanceId: string
} | Failure);

export type RequestMessage =
  LoginRequest |
  OperationRequest |
  LogoutRequest;

export type ResponseMessage =
  LoginResponse |
  OperationResponse |
  LogoutResponse;

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
  operationRequests = null;
  constructor(
    private torusService: TorusService,
    private importService: ImportService,
    private walletService: WalletService,
    private coordinatorService: CoordinatorService,
    private route: ActivatedRoute,
    private lookupService: LookupService
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
    this.route.queryParams
      .filter(params => params.instanceId)
      .subscribe(params => {
        this.walletService.loadStoredWallet(params.instanceId);
        if (this.walletService.wallet instanceof EmbeddedTorusWallet) {
          this.origin = this.walletService.wallet.origin;
          this.activeAccount = this.walletService.wallet.implicitAccounts[0];
          this.coordinatorService.startAll();
        }
      }
    );
  }
  handleRequest = (evt) => {
    try {
      const data: RequestMessage = JSON.parse(evt.data);
      if (this.allowedOrigins.includes(evt.origin)) {
        console.log(`Received ${evt.data} from ${evt.origin}`);
        if (data && data.type && /* restricted to dev enviroment for now */ !CONSTANTS.MAINNET) {
          this.origin = evt.origin;
          switch (data.type) {
            case MessageTypes.loginRequest:
              this.login = true;
              break;
            case MessageTypes.operationRequest:
              if (this.walletService.wallet instanceof EmbeddedTorusWallet && evt.origin === this.walletService.wallet.origin &&
                data.operations) {
                this.operationRequests = this.beaconTypeGuard(data.operations);
              }
              break;
            case MessageTypes.logoutRequest:
              if (this.walletService.wallet instanceof EmbeddedTorusWallet && evt.origin === this.walletService.wallet.origin && 
                this.walletService.wallet.instanceId) {
                const instanceId = this.walletService.wallet.instanceId;
                this.logout(instanceId);
                this.sendResponse({
                  type: MessageTypes.logoutResponse,
                  instanceId
                });
              } else {
                this.sendResponse({
                  type: MessageTypes.logoutResponse,
                  failed: true,
                  error: 'NO_WALLET_FOUND'
                });
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
      const filteredUserInfo = { typeOfLogin: userInfo.typeOfLogin, id: userInfo.verifierId, name: userInfo.name };
      const instanceId = this.generateInstanceId();
      this.sendResponse({
        type: MessageTypes.loginResponse,
        // 128 bits of entropy, base58 encoded
        // TODO should the OperationsService be used instead of this dependancy??
        instanceId,
        pk: keyPair.pk,
        pkh: keyPair.pkh,
        userData: filteredUserInfo
      });
      this.importAccount(keyPair, userInfo, instanceId);
    } else {
      this.abort();
    }
    this.login = false;
  }
  abort() {
    this.sendResponse({ type: MessageTypes.loginResponse, failed: true, error: 'ABORTED_BY_USER' });
  }
  operationResponse(opHash: string) {
    this.operationRequests = null;
    this.sendResponse(opHash
      ? { type: MessageTypes.operationResponse, opHash }
      : { type: MessageTypes.operationResponse, failed: true, error: 'ABORTED_BY_USER' });
  }
  private sendResponse(resp: ResponseMessage) {
    window.parent.window.postMessage(JSON.stringify(resp), this.origin);
  }
  private async importAccount(keyPair: KeyPair, userInfo: any, instanceId: string) {
    if (keyPair) {
      await this.importService
        .importWalletFromPk(keyPair.pk, '', { verifier: userInfo.typeOfLogin, id: userInfo.verifierId, name: userInfo.name, embedded: true, origin: this.origin }, keyPair.sk, instanceId)
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
  private beaconTypeGuard(transactions: PartialTezosTransactionOperation[]): any {
    try {
      transactions.forEach((tx) => {
        if (
          tx.kind !== 'transaction' ||
          typeof tx.amount !== 'string' ||
          !utils.validAddress(tx.destination)
        ) {
          throw new Error('Invalid transaction');
        }
      });
    } catch (e) {
      console.warn(e);
      return null;
    }
    return { operationDetails: transactions };
  }
  private generateInstanceId(): string {
    return common.base58encode(utils.mnemonicToEntropy(utils.generateMnemonic(15)), new Uint8Array([]));
  }
  private logout(instanceId: string) {
    this.coordinatorService.stopAll();
    this.walletService.clearWallet(instanceId);
    this.lookupService.clear();
  }
}
