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
import {
  RequestTypes,
  ResponseTypes,
  RequestMessage,
  ResponseMessage,
  OperationResponse
} from 'kukai-embed/dist/types'

@Component({
  selector: 'app-embedded',
  templateUrl: './embedded.component.html',
  styleUrls: ['./embedded.component.scss']
})
export class EmbeddedComponent implements OnInit {
  allowedOrigins = ['http://localhost:3000', 'https://www.tezos.help'];
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
    window.parent.window.postMessage(JSON.stringify({ type: ResponseTypes.initResponse, failed: false }), this.origin || "*");
  }
  handleRequest = (evt) => {
    try {
      const data: RequestMessage = JSON.parse(evt.data);
      if (this.allowedOrigins.includes(evt.origin)) {
        console.log(`Received ${evt.data} from ${evt.origin}`);
        if (data &&
          data.type &&
          /* restricted to dev enviroment for now */ !CONSTANTS.MAINNET &&
          evt.origin === this.walletService.wallet.origin) {
          this.origin = evt.origin;
          switch (data.type) {
            case RequestTypes.loginRequest:
              this.handleLoginRequest(data)
              break;
            case RequestTypes.operationRequest:
              this.handleOperationRequest(data)
              break;
            case RequestTypes.trackRequest:
              this.handleTrackRequest(data)
            case RequestTypes.logoutRequest:
              this.handleLogoutRequest(data)
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
  private handleLoginRequest(req: LoginRequest) {
    this.login = true;
  }
  private handleOperationRequest(req: OperationRequest) {
    if (this.walletService.wallet instanceof EmbeddedTorusWallet && data.operations) {
      this.operationRequests = this.beaconTypeGuard(req.operations);
    } else {
      this.sendResponse({
        type: ResponseTypes.operationResponse,
        failed: true,
        error: 'NO_WALLET_FOUND'
      });
    }
  }
  private handleTrackRequest(req: TrackRequest) {
    this,sendResponse({
      type: ResponseTypes.trackResponse,
      failed: true,
      error: 'NOT_IMPLEMENTED'
    })
  }
  private handleLogoutRequest(req: LogoutRequest) {
    if (this.walletService.wallet instanceof EmbeddedTorusWallet && this.walletService.wallet.instanceId) {
      const instanceId = this.walletService.wallet.instanceId;
      this.logout(instanceId);
      this.sendResponse({
        type: ResponseTypes.logoutResponse,
        instanceId,
        failed: false
      });
    } else {
      this.noWalletError();
    }
  }
  loginResponse(loginData: any) {
    if (loginData) {
      const { keyPair, userInfo } = loginData;
      const filteredUserInfo = { typeOfLogin: userInfo.typeOfLogin, id: userInfo.verifierId, name: userInfo.name };
      // 160 bits of entropy, base58 encoded
      const instanceId = this.generateInstanceId();
      this.sendResponse({
        type: ResponseTypes.loginResponse,
        instanceId,
        pk: keyPair.pk,
        pkh: keyPair.pkh,
        userData: filteredUserInfo,
        failed: false
      });
      this.importAccount(keyPair, userInfo, instanceId);
    } else {
      this.abort();
    }
    this.login = false;
  }
  abort() {
    this.sendResponse({ type: ResponseTypes.loginResponse, failed: true, error: 'ABORTED_BY_USER' });
  }
  noWalletError() {
    this.sendResponse({
      type: ResponseTypes.logoutResponse,
      failed: true,
      error: 'NO_WALLET_FOUND'
    });
  }
  operationResponse(opHash: string) {
    this.operationRequests = null;
    let response: OperationResponse;
    if (!opHash) {
      response = { type: ResponseTypes.operationResponse, failed: true, error: 'ABORTED_BY_USER' };
    } else if (opHash === 'broadcast_error') {
      response = { type: ResponseTypes.operationResponse, failed: true, error: 'BROADCAST_ERROR' };
    } else {
      response = { type: ResponseTypes.operationResponse, opHash, failed: false };
    }
    this.sendResponse(response);
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
