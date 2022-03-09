import { Component, ElementRef, OnInit } from '@angular/core';
import { TorusService } from '../../../services/torus/torus.service';
import { CONSTANTS } from '../../../../environments/environment';
import { ImportService } from '../../../services/import/import.service';
import { KeyPair } from '../../../interfaces';
import { WalletService } from '../../../services/wallet/wallet.service';
import { PartialTezosTransactionOperation } from '@airgap/beacon-sdk';
import { EmbeddedTorusWallet, ImplicitAccount } from '../../../services/wallet/wallet';
import { CoordinatorService } from '../../../services/coordinator/coordinator.service';
import { utils, common } from '@tezos-core-tools/crypto-utils';
import { ActivatedRoute } from '@angular/router';
import { LookupService } from '../../../services/lookup/lookup.service';
import { ActivityService } from '../../../services/activity/activity.service';
import { EmbeddedAuthService } from '../../../services/embedded-auth/embedded-auth.service';
import {
  RequestTypes,
  ResponseTypes,
  RequestMessage,
  ResponseMessage,
  OperationResponse,
  LogoutRequest,
  TrackRequest,
  LoginRequest,
  OperationRequest,
  AuthRequest,
  CardRequest,
  CardResponse,
  SignExprRequest,
  SignExprResponse,
  LoginConfig,
  LoginPrio
} from 'kukai-embed';
import { Subscription } from 'rxjs';
import { SubjectService } from '../../../services/subject/subject.service';
import { InputValidationService } from '../../../services/input-validation/input-validation.service';
enum Permission {
  LOGIN = 'login',
  OPERATIONS = 'operations',
  MICHELINE = 'micheline',
  MICHELINE_SILENT = 'micheline_silent'
}
interface Permissions {
  origins: string[];
  permissions: {
    [Permission.LOGIN]: boolean;
    [Permission.OPERATIONS]: boolean;
    [Permission.MICHELINE]: boolean;
    [Permission.MICHELINE_SILENT]?: boolean;
  };
}
@Component({
  selector: 'app-embedded',
  templateUrl: './embedded.component.html',
  styleUrls: ['../../../../scss/components/views/embedded/embedded.component.scss']
})
export class EmbeddedComponent implements OnInit {
  readonly permissionMatrix: Record<string, Permissions> = {
    brio: {
      origins: ['https://playwithbrio.com', 'https://www.playwithbrio.com', 'https://production.playwithbrio.com'],
      permissions: {
        login: true,
        operations: true,
        micheline: true
      }
    },
    minterpop: {
      origins: ['https://minterpop.com'],
      permissions: {
        login: true,
        operations: true,
        micheline: true
      }
    },
    interpop: {
      origins: ['https://interpopcomics.com', 'https://www.interpopcomics.com'],
      permissions: {
        login: true,
        operations: true,
        micheline: true
      }
    },
    humanMachine: {
      origins: ['https://human-machine.io'],
      permissions: {
        login: true,
        operations: false,
        micheline: false
      }
    },
    ubisoft: {
      origins: ['*.ubisoft.com'],
      permissions: {
        login: true,
        operations: false,
        micheline: true
      }
    },
    gap: {
      origins: ['*.gap.com'],
      permissions: {
        login: true,
        operations: true,
        micheline: true,
        micheline_silent: true
      }
    },
    lexus: {
      origins: ['https://ldai.lexusdesign.in'],
      permissions: {
        login: true,
        operations: false,
        micheline: false
      }
    },
    blockspace: {
      origins: ['https://block-space.app'],
      permissions: {
        login: true,
        operations: false,
        micheline: false
      }
    }
  };
  constructor(
    private torusService: TorusService,
    private importService: ImportService,
    private walletService: WalletService,
    private coordinatorService: CoordinatorService,
    private route: ActivatedRoute,
    private lookupService: LookupService,
    private activityService: ActivityService,
    private embeddedAuthService: EmbeddedAuthService,
    private subjectService: SubjectService,
    private inputValidationService: InputValidationService,
    private elRef: ElementRef
  ) {}
  pendingOps: string[] = [];
  ophashSubscription: Subscription;
  origin = '';
  login = false;
  dismiss: Boolean = null;
  blockCard = true;
  activeAccount: ImplicitAccount = null;
  template = null;
  operationRequests = null;
  signRequest = null;
  loginConfig: LoginConfig = null;
  queueMode: LoginPrio = null;
  currentInstanceId = '';

  ngOnInit(): void {
    const htmlElem = this.elRef.nativeElement.closest('html');
    htmlElem.style.fontSize = '100%';
    document.body.style.background = 'none';
    this.torusService.initTorus();
    if (window.addEventListener) {
      window.addEventListener('message', this.handleRequest, false);
    } else {
      (window as any).attachEvent('onmessage', this.handleRequest);
    }
    console.log('icabod is connected...');
    this.route.queryParams
      .filter((params) => params.instanceId)
      .subscribe((params) => {
        this.walletService.loadStoredWallet(params.instanceId);
        this.currentInstanceId = params.instanceId;
        if (this.walletService.wallet instanceof EmbeddedTorusWallet) {
          this.origin = this.walletService.wallet.origin;
          this.subjectService.origin.next(this.origin);
          if (this.walletService.wallet?.implicitAccounts[0]) {
            this.activeAccount = this.walletService.wallet.implicitAccounts[0];
            this.coordinatorService.startXTZ();
            this.coordinatorService.start(this.activeAccount.address, this.coordinatorService.defaultDelayActivity);
            this.subscribeToConfirmedOps();
          }
        }
      });
    window.parent.window.postMessage(JSON.stringify({ type: ResponseTypes.initComplete, failed: false }), this.origin || '*');
  }
  handleRequest = (evt) => {
    try {
      const data: RequestMessage = JSON.parse(evt.data);
      if (this.hasPermission(null, evt.origin)) {
        console.log(`Received ${evt.data} from ${evt.origin}`);
        if (data && data.type) {
          this.origin = evt.origin;
          this.subjectService.origin.next(this.origin);
          switch (data.type) {
            case RequestTypes.loginRequest:
              this.handleLoginRequest(data);
              break;
            case RequestTypes.operationRequest:
              this.handleOperationRequest(data);
              break;
            case RequestTypes.signExprRequest:
              this.handleSignExprRequest(data);
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
        console.error(`Invalid origin (${evt.origin})`);
      }
    } catch {}
  };
  private handleSignExprRequest(req: SignExprRequest) {
    if (!this.hasPermission(Permission.MICHELINE)) {
      const response: ResponseMessage = {
        type: ResponseTypes.signExprResponse,
        failed: true,
        error: 'NO_PERMISSION'
      };
      this.sendResponse(response);
      return;
    }
    if (this.walletService.wallet instanceof EmbeddedTorusWallet && this.walletService.wallet.implicitAccounts[0] && req.expr) {
      if (req.expr.slice(0, 2) === '0x') {
        req.expr = req.expr.slice(2);
      }
      if (this.inputValidationService.isMichelineExpr(req.expr)) {
        if (req?.ui?.silent && this.hasPermission(Permission.MICHELINE_SILENT)) {
          this.embeddedAuthService
            .signExprSilent(req.expr)
            .then((signature) => {
              this.signResponse(signature);
            })
            .catch((e) => {
              this.sendResponse({
                type: ResponseTypes.signExprResponse,
                failed: true,
                error: e.message ? e.message : 'UNKNOWN_ERROR'
              });
            });
        } else {
          this.signRequest = {
            payload: req.expr,
            ui: this.normalizeTemplate(req?.ui)
          };
        }
      } else {
        this.sendResponse({
          type: ResponseTypes.signExprResponse,
          failed: true,
          error: 'INVALID_PARAMETERS'
        });
      }
    } else {
      let response: ResponseMessage;
      if (!(this.walletService.wallet instanceof EmbeddedTorusWallet) || !this.walletService.wallet.implicitAccounts[0]) {
        response = {
          type: ResponseTypes.signExprResponse,
          failed: true,
          error: 'NO_WALLET_FOUND'
        };
      } else {
        response = {
          type: ResponseTypes.signExprResponse,
          failed: true,
          error: 'INVALID_PARAMETERS'
        };
      }
      this.sendResponse(response);
    }
  }
  public signResponse(response: any) {
    this.signRequest = null;
    let resp: SignExprResponse;
    if (response && typeof response === 'string' && response.length > 95 && response.slice(0, 5) === 'spsig') {
      resp = {
        type: ResponseTypes.signExprResponse,
        failed: false,
        signature: response
      };
    } else {
      resp = {
        type: ResponseTypes.signExprResponse,
        failed: true,
        error: 'ABORTED_BY_USER'
      };
    }
    this.sendResponse(resp);
  }
  private handleLoginRequest(req: LoginRequest) {
    if (!this.hasPermission(Permission.LOGIN)) {
      const response: ResponseMessage = {
        type: ResponseTypes.loginResponse,
        failed: true,
        error: 'NO_PERMISSION'
      };
      this.sendResponse(response);
      return;
    }
    this.queueMode = req?.config.customPrio ? req?.config.customPrio : null;
    if (this.activeAccount || (this.queueMode === 'low' && this.walletService.wallet)) {
      const response: ResponseMessage = {
        type: ResponseTypes.loginResponse,
        failed: true,
        error: 'ALREADY_LOGGED_IN'
      };
      this.sendResponse(response);
    } else if (this.queueMode === 'high' && !this.walletService.wallet) {
      const response: ResponseMessage = {
        type: ResponseTypes.loginResponse,
        failed: true,
        error: 'NO_WALLET_FOUND'
      };
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
    if (!this.hasPermission(Permission.OPERATIONS)) {
      const response: ResponseMessage = {
        type: ResponseTypes.operationResponse,
        failed: true,
        error: 'NO_PERMISSION'
      };
      this.sendResponse(response);
      return;
    }
    if (this.walletService.wallet instanceof EmbeddedTorusWallet && this.walletService.wallet.implicitAccounts[0] && req.operations) {
      if (this.isValidOperation(req.operations)) {
        this.template = req.ui ? this.normalizeTemplate(req.ui) : null;
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
  async loginResponse(loginData: any) {
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
      const { idToken = '', accessToken = '', long_lived_token = '', ...filteredUserInfo } = { ...userInfo };
      let instanceId;
      if (
        this.walletService.wallet &&
        this.walletService.wallet instanceof EmbeddedTorusWallet &&
        keyPair?.pk &&
        !this.walletService.wallet.implicitAccounts[0] &&
        this.currentInstanceId
      ) {
        instanceId = this.currentInstanceId;
      } else {
        // 160 bits of entropy, base58 encoded
        instanceId = this.generateInstanceId();
      }
      response = {
        type: ResponseTypes.loginResponse,
        instanceId,
        pk: keyPair.pk,
        pkh: keyPair.pkh,
        userData: filteredUserInfo,
        failed: false
      };
      toImport = { keyPair, userInfo, instanceId };
      if (this.loginConfig?.authParams) {
        try {
          response.authResponse = await this.embeddedAuthService.authenticate(this.loginConfig.authParams, this.origin, keyPair);
        } catch (e) {
          console.error(e);
          response = {
            type: ResponseTypes.loginResponse,
            failed: true,
            error: e?.message
          };
          toImport = undefined;
        }
      }
    } else {
      this.dismiss = null;
      response = {
        type: ResponseTypes.loginResponse,
        failed: true,
        error: 'ABORTED_BY_USER'
      };
    }
    const loginConfig = this.loginConfig;
    if (this.dismiss === null) {
      this.login = false;
      this.loginConfig = null;
    }
    setTimeout(() => {
      this.sendResponse(response);
      if (toImport) {
        if (loginConfig?.strictAuth) {
          toImport.keyPair.sk = '';
        }
        this.importAccount(toImport.keyPair, toImport.userInfo, toImport.instanceId);
      }
    }, 10);
  }
  async handleAuthRequest(authReq: AuthRequest) {
    if (!this.hasPermission(Permission.LOGIN)) {
      const response: ResponseMessage = {
        type: ResponseTypes.loginResponse,
        failed: true,
        error: 'NO_PERMISSION'
      };
      this.sendResponse(response);
      return;
    }
    this.embeddedAuthService
      .authenticate(authReq, this.origin)
      .then((authResponse: any) => {
        this.sendResponse({
          type: ResponseTypes.authResponse,
          failed: false,
          message: authResponse.message,
          signature: authResponse.signature
        });
      })
      .catch((e: Error) => {
        this.sendResponse({
          type: ResponseTypes.authResponse,
          failed: true,
          error: e.message ? e.message : 'UNKNOWN_ERROR'
        });
      });
  }
  handleCardRequest(req: CardRequest) {
    this.blockCard = !req.show;
    const response: CardResponse = {
      type: ResponseTypes.cardResponse,
      failed: false
    };
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
      response = {
        type: ResponseTypes.operationResponse,
        failed: true,
        error: 'ABORTED_BY_USER'
      };
    } else if (opHash === 'exceeded_threshold') {
      response = {
        type: ResponseTypes.operationResponse,
        failed: true,
        error: 'EXEEDED_THRESHOLD'
      };
    } else if (opHash === 'broadcast_error') {
      response = {
        type: ResponseTypes.operationResponse,
        failed: true,
        error: 'BROADCAST_ERROR',
        errorMessage
      };
    } else if (opHash === 'invalid_parameters') {
      response = {
        type: ResponseTypes.operationResponse,
        failed: true,
        error: 'INVALID_PARAMETERS',
        errorMessage
      };
    } else if (utils.validOperationHash(opHash)) {
      response = {
        type: ResponseTypes.operationResponse,
        opHash,
        failed: false
      };
    } else {
      console.warn('Unknown operation response:', opHash);
      response = {
        type: ResponseTypes.operationResponse,
        failed: true,
        error: 'UNKNOWN_ERROR'
      };
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
    if (keyPair?.pk) {
      await this.importService
        .importWalletFromPk(
          keyPair.pk,
          '',
          {
            verifier: userInfo.typeOfLogin,
            id: userInfo.verifierId,
            name: userInfo.name,
            embedded: true,
            origin: this.origin
          },
          keyPair.sk,
          instanceId
        )
        .then((success: boolean) => {
          if (success) {
            this.activeAccount = this.walletService.wallet.implicitAccounts[0];
            this.coordinatorService.startXTZ();
            this.coordinatorService.start(this.activeAccount.address, this.coordinatorService.defaultDelayActivity);
            this.subscribeToConfirmedOps();
          }
        });
    } else if (keyPair?.pk === '') {
      // login without keys
      await this.importService.importWalletFromPk(
        keyPair.pk,
        '',
        {
          verifier: userInfo.typeOfLogin,
          id: userInfo.verifierId,
          name: userInfo.name,
          embedded: true,
          origin: this.origin
        },
        '',
        instanceId
      );
    }
    this.currentInstanceId = instanceId;
  }
  private isValidOperation(transactions: PartialTezosTransactionOperation[]): boolean {
    try {
      transactions.forEach((tx) => {
        if (tx.kind !== 'transaction' || typeof tx.amount !== 'string' || !utils.validAddress(tx.destination)) {
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
    this.subjectService.logout.next(true);
    this.walletService.clearWallet(instanceId);
    this.lookupService.clear();
    this.activeAccount = null;
    if (this.ophashSubscription) {
      this.ophashSubscription.unsubscribe();
    }
    this.currentInstanceId = '';
  }
  subscribeToConfirmedOps() {
    this.ophashSubscription = this.subjectService.confirmedOp.subscribe((opHash) => {
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
  private normalizeTemplate(template: any): any {
    if (template?.descriptions) {
      for (let i in template.descriptions) {
        if (typeof template.descriptions[i] === 'string') {
          template.descriptions[i] = {
            text: template.descriptions[i]
          };
        }
      }
    }
    return template;
  }
  private hasPermission(permission: Permission, origin: string = this.origin): boolean {
    if (!CONSTANTS.MAINNET) {
      return true;
    }
    try {
      const keys = Object.keys(this.permissionMatrix);
      for (const key of keys) {
        for (const allowedOrigin of this.permissionMatrix[key].origins) {
          if (allowedOrigin.startsWith('*.') ? origin.endsWith(allowedOrigin.slice(1)) : origin === allowedOrigin) {
            return permission ? this.permissionMatrix[key].permissions[permission] : !!this.permissionMatrix[key].permissions;
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }
}
