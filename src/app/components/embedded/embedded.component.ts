import { Component, HostListener, OnInit } from '@angular/core';
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
import { ActivityService } from '../../services/activity/activity.service'
import {
  RequestTypes,
  ResponseTypes,
  RequestMessage,
  ResponseMessage,
  OperationResponse,
  LogoutRequest,
  TrackRequest,
  TrackResponse,
  LoginRequest,
  OperationRequest
} from 'kukai-embed/dist/types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-embedded',
  templateUrl: './embedded.component.html',
  styleUrls: ['./embedded.component.scss']
})
export class EmbeddedComponent implements OnInit {
  constructor(
    private torusService: TorusService,
    private importService: ImportService,
    private walletService: WalletService,
    private coordinatorService: CoordinatorService,
    private route: ActivatedRoute,
    private lookupService: LookupService,
    private activityService: ActivityService
  ) { }
  allowedOrigins = ['http://localhost', 'http://localhost:3000', 'https://www.tezos.help', 'https://x-tz.com'];
  pendingOps: string[] = [];
  ophashSubscription: Subscription;
  origin = '';
  login = false;
  blockCard = false;
  activeAccount: ImplicitAccount = null;
  operationRequests = null;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth === 400) {
      this.blockCard = false;
    }
  }

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
          this.subscribeToConfirmedOps();
        }
      }
      );
  }
  handleRequest = (evt) => {
    try {
      const data: RequestMessage = JSON.parse(evt.data);
      if (this.allowedOrigins.includes(evt.origin)) {
        console.log(`Received ${evt.data} from ${evt.origin}`);
        if (data &&
          data.type &&
          /* restricted to dev enviroment for now */ !CONSTANTS.MAINNET) {
          this.origin = evt.origin;
          switch (data.type) {
            case RequestTypes.loginRequest:
              this.handleLoginRequest(data);
              break;
            case RequestTypes.operationRequest:
              this.handleOperationRequest(data);
              break;
            case RequestTypes.trackRequest:
              this.handleTrackRequest(data);
              break;
            case RequestTypes.logoutRequest:
              this.handleLogoutRequest(data);
              break;
            default:
              console.warn('Unknown request', data);
          }
        }
      } else if (data && data.type) {
        console.log(`Invalid origin (${evt.origin})`);
      }
    } catch { }
  }
  private handleLoginRequest(req: LoginRequest) {
    if (this.activeAccount) {
      const response: ResponseMessage = { type: ResponseTypes.loginResponse, failed: true, error: 'ALREADY_LOGGED_IN' };
      this.sendResponse(response);
    } else {
      this.login = true;
      this.sendResizeReady();
    }
  }
  private handleOperationRequest(req: OperationRequest) {
    if (this.walletService.wallet instanceof EmbeddedTorusWallet && req.operations) {
      this.sendResizeReady();
      this.operationRequests = this.isValidOperation(req.operations) ? req.operations : null;
      if (this.isValidOperation(req.operations)) {
        this.operationRequests = req.operations;
      } else {
        this.operationRequests = null;
        this.sendResponse({
          type: ResponseTypes.operationResponse,
          failed: true,
          error: 'INVALID_TRANSACTION'
        });
      }
    } else {
      this.sendResizeReady();
      this.sendResponse({
        type: ResponseTypes.operationResponse,
        failed: true,
        error: 'NO_WALLET_FOUND'
      });
    }
  }
  private async handleTrackRequest(req: TrackRequest) {
    this.pendingOps.push(req.opHash);
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
    let response: ResponseMessage;
    if (loginData) {
      const { keyPair, userInfo } = loginData;
      const filteredUserInfo = { typeOfLogin: userInfo.typeOfLogin, id: userInfo.verifierId, name: userInfo.name };
      // 160 bits of entropy, base58 encoded
      const instanceId = this.generateInstanceId();
      response = {
        type: ResponseTypes.loginResponse,
        instanceId,
        pk: keyPair.pk,
        pkh: keyPair.pkh,
        userData: filteredUserInfo,
        failed: false
      };
      this.importAccount(keyPair, userInfo, instanceId);
    } else {
      response = { type: ResponseTypes.loginResponse, failed: true, error: 'ABORTED_BY_USER' };
    }
    this.login = false;
    setTimeout(() => {
      this.sendResponse(response);
    }, 0);
  }
  noWalletError() {
    this.sendResponse({
      type: ResponseTypes.logoutResponse,
      failed: true,
      error: 'NO_WALLET_FOUND'
    });
  }
  operationResponse(opHash: string) {
    let response: OperationResponse;
    if (!opHash) {
      response = { type: ResponseTypes.operationResponse, failed: true, error: 'ABORTED_BY_USER' };
    } else if (opHash === 'broadcast_error') {
      response = { type: ResponseTypes.operationResponse, failed: true, error: 'BROADCAST_ERROR' };
    } else if (opHash === 'invalid_parameters') {
      response = { type: ResponseTypes.operationResponse, failed: true, error: 'INVALID_PARAMETERS' };
    } else {
      response = { type: ResponseTypes.operationResponse, opHash, failed: false };
    }
    this.operationRequests = null;
    setTimeout(() => {
      this.sendResponse(response);
    }, 0);
  }
  private sendResponse(resp: ResponseMessage) {
    window.parent.window.postMessage(JSON.stringify(resp), this.origin);
  }
  private sendResizeReady() {
    this.blockCard = true;
    setTimeout(() => {
      this.sendResponse({
        type: ResponseTypes.resize,
        failed: false
      });
    }, 0);
  }
  private async importAccount(keyPair: KeyPair, userInfo: any, instanceId: string) {
    if (keyPair) {
      await this.importService
        .importWalletFromPk(keyPair.pk, '', { verifier: userInfo.typeOfLogin, id: userInfo.verifierId, name: userInfo.name, embedded: true, origin: this.origin }, keyPair.sk, instanceId)
        .then((success: boolean) => {
          if (success) {
            this.activeAccount = this.walletService.wallet.implicitAccounts[0];
            this.coordinatorService.startAll();
            this.subscribeToConfirmedOps();
          }
        });
    }
  }
  private isValidOperation(transactions: PartialTezosTransactionOperation[]): boolean {
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
      return false;
    }
    return true;
  }
  private generateInstanceId(): string {
    return common.base58encode(utils.mnemonicToEntropy(utils.generateMnemonic(15)), new Uint8Array([]));
  }
  private logout(instanceId: string) {
    this.coordinatorService.stopAll();
    this.walletService.clearWallet(instanceId);
    this.lookupService.clear();
    this.activeAccount = null;
    this.ophashSubscription.unsubscribe();
  }
  subscribeToConfirmedOps() {
    this.ophashSubscription = this.activityService.confirmedOp.subscribe((opHash) => {
      if (this.pendingOps.includes(opHash)) {
        this.sendResponse({
          type: ResponseTypes.trackResponse,
          opHash: opHash,
          failed: false
        });
        for (let i = 0; i < this.pendingOps.length; i++) {
          if (this.pendingOps[i] === opHash) {
            this.pendingOps.splice(i, 1);
          }
        }
      }
    })
  }
}
