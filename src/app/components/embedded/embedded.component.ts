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
import { ActivityService } from '../../services/activity/activity.service';
import { EmbeddedAuthService } from '../../services/embedded-auth/embedded-auth.service';
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
  OperationRequest,
  AuthRequest,
  AuthResponse,
  Init,
  CardRequest,
  CardResponse
} from 'kukai-embed';
import { Subscription } from 'rxjs';
import { SubjectService } from '../../services/subject/subject.service';

@Component({
  selector: 'app-embedded',
  templateUrl: './embedded.component.html',
  styleUrls: ['../../../scss/components/embedded/embedded.component.scss']
})
export class EmbeddedComponent implements OnInit {
  constructor(
    private torusService: TorusService,
    private importService: ImportService,
    private walletService: WalletService,
    private coordinatorService: CoordinatorService,
    private route: ActivatedRoute,
    private lookupService: LookupService,
    private activityService: ActivityService,
    private embeddedAuthService: EmbeddedAuthService,
    private subjectService: SubjectService
  ) { }
  pendingOps: string[] = [];
  ophashSubscription: Subscription;
  origin = '';
  login = false;
  dismiss: Boolean = null;
  blockCard = true;
  activeAccount: ImplicitAccount = null;
  template = null;
  operationRequests = null;
  loginConfig = null;

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
          this.subjectService.origin.next(this.origin);
          this.activeAccount = this.walletService.wallet.implicitAccounts[0];
          this.coordinatorService.startAll();
          this.subscribeToConfirmedOps();
        }
      }
      );
    window.parent.window.postMessage(JSON.stringify({ type: ResponseTypes.initComplete, failed: false }), this.origin || '*');
  }
  handleRequest = (evt) => {
    try {
      const data: RequestMessage = JSON.parse(evt.data);
      if (!CONSTANTS.MAINNET || CONSTANTS.ALLOWED_EMBED_ORIGINS.includes(evt.origin)) {
        console.log(`Received ${evt.data} from ${evt.origin}`);
        if (data &&
          data.type) {
          this.origin = evt.origin;
          this.subjectService.origin.next(this.origin);
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
            case RequestTypes.authRequest:
              this.handleAuthRequest(data);
              break;
            case RequestTypes.cardRequest:
              this.handleCardRequest(data);
              break;
            case RequestTypes.dismissRequest:
              this.dismiss = true;
              break;
            default:
              console.warn('Unknown request', data);
          }
        }
      } else if (data && data.type) {
        console.warn(`Invalid origin (${evt.origin})`);
      }
    } catch { }
  }
  private handleLoginRequest(req: LoginRequest) {
    if (this.activeAccount) {
      const response: ResponseMessage = { type: ResponseTypes.loginResponse, failed: true, error: 'ALREADY_LOGGED_IN' };
      this.sendResponse(response);
    } else {
      if (req?.config?.customSpinnerDismissal) {
        this.dismiss = false;
      }
      if (req?.config) {
        this.loginConfig = req.config;
      }
      this.login = true;
    }
  }
  private handleOperationRequest(req: OperationRequest) {
    if (this.walletService.wallet instanceof EmbeddedTorusWallet && req.operations) {
      if (this.isValidOperation(req.operations)) {
        this.template = req.ui ? req.ui : null;
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
    let toImport: any;
    if (loginData === 'dismiss') {
      this.dismiss = null;
      response = {
        type: ResponseTypes.dismissResponse,
        failed: false
      };
    } else if (loginData) {
      const { keyPair, userInfo } = loginData;
      const { idToken = '', accessToken = '', ...filteredUserInfo } = { ...userInfo };
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
      toImport = { keyPair, userInfo, instanceId };
    } else {
      this.dismiss = null;
      response = { type: ResponseTypes.loginResponse, failed: true, error: 'ABORTED_BY_USER' };
    }
    if (this.dismiss === null) {
      this.login = false;
      this.loginConfig = null;
    }
    setTimeout(() => {
      this.sendResponse(response);
      if (toImport) {
        this.importAccount(toImport.keyPair, toImport.userInfo, toImport.instanceId);
      }
    }, 10);
  }
  async handleAuthRequest(authReq: AuthRequest) {
    this.embeddedAuthService.authenticate(authReq, this.origin).then((authResponse: any) => {
      this.sendResponse({
        type: ResponseTypes.authResponse,
        failed: false,
        message: authResponse.message,
        signature: authResponse.signature
      });
    }).catch((e: Error) => {
      this.sendResponse({
        type: ResponseTypes.authResponse,
        failed: true,
        error: e.message ? e.message : 'UNKNOWN_ERROR'
      });
    });
  }
  handleCardRequest(req: CardRequest) {
    this.blockCard = !req.show;
    const response: CardResponse = { type: ResponseTypes.cardResponse, failed: false };
    this.sendResponse(response);
  }
  noWalletError() {
    this.sendResponse({
      type: ResponseTypes.logoutResponse,
      failed: true,
      error: 'NO_WALLET_FOUND'
    });
  }
  operationResponse(opHash: any) {
    let response: OperationResponse;
    let errorMessage = '';
    if (opHash?.error && opHash.errorMessage) {
      errorMessage = opHash.errorMessage;
      opHash = opHash.error;
    }
    if (!opHash) {
      response = { type: ResponseTypes.operationResponse, failed: true, error: 'ABORTED_BY_USER' };
    } else if (opHash === 'exceeded_threshold') {
      response = { type: ResponseTypes.operationResponse, failed: true, error: 'EXEEDED_THRESHOLD' };
    } else if (opHash === 'broadcast_error') {
      response = { type: ResponseTypes.operationResponse, failed: true, error: 'BROADCAST_ERROR', errorMessage };
    } else if (opHash === 'invalid_parameters') {
      response = { type: ResponseTypes.operationResponse, failed: true, error: 'INVALID_PARAMETERS', errorMessage };
    } else if (utils.validOperationHash(opHash)) {
      response = { type: ResponseTypes.operationResponse, opHash, failed: false };
    } else {
      console.warn('Unknown operation response:', opHash);
      response = { type: ResponseTypes.operationResponse, failed: true, error: 'UNKNOWN_ERROR' };
    }
    this.template = null;
    this.operationRequests = null;
    setTimeout(() => {
      this.sendResponse(response);
    }, 0);
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
    });
  }
}
