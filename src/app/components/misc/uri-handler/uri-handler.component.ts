import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { MessageService } from '../../../services/message/message.service';
import { WalletClient, BeaconMessageType, PermissionScope, PermissionResponseInput, OperationResponseInput } from '@airgap/beacon-sdk';
import { WalletService } from '../../../services/wallet/wallet.service';
import { CONSTANTS } from '../../../../environments/environment';
import { Account } from '../../../services/wallet/wallet';
import { BeaconService } from '../../../services/beacon/beacon.service';
import { DeeplinkService } from '../../../services/deeplink/deeplink.service';
import { assertMichelsonData } from '@taquito/michel-codec';
import { InputValidationService } from '../../../services/input-validation/input-validation.service';
import { SubjectService } from '../../../services/subject/subject.service';
import { Subscription } from 'rxjs';
import { ExternalRequest } from '../../../interfaces';
import { WalletConnectService } from '../../../services/wallet-connect/wallet-connect.service';
import { ModalComponent } from '../../../components/modals/modal.component';

@Component({
  selector: 'app-uri-handler',
  templateUrl: './uri-handler.component.html'
})
export class UriHandlerComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  constructor(
    public messageService: MessageService,
    public walletService: WalletService,
    private beaconService: BeaconService,
    private deeplinkService: DeeplinkService,
    private inputValidationService: InputValidationService,
    private subjectService: SubjectService,
    private walletConnectService: WalletConnectService
  ) {
    this.subscriptions.add(
      this.subjectService.activeAccount.subscribe((activeAccount) => {
        this.activeAccount = activeAccount;
      })
    );
    this.subscriptions.add(
      this.subjectService.wc2.subscribe((m) => {
        this.handleBeaconMessage(m);
      })
    );
    this.subscriptions.add(
      this.walletConnectService.triggerReBroadcast.subscribe(() => {
        const req: any = this.permissionRequest || this.externalRequest?.operationRequest || this.signRequest;
        if (req) {
          this.walletConnectService.reBroadcast(req);
        }
      })
    );
    this.subscriptions.add(
      this.walletConnectService.changeSessionAccount.subscribe((topic: string) => {
        ModalComponent.currentModel.next({ name: 'session-select', data: { topic, preSelectedAccountAddress: this.activeAccount?.pkh } });
      })
    );
  }
  permissionRequest: PermissionResponseInput = null;
  externalRequest: ExternalRequest = null;
  signRequest: any = null;
  activeAccount: Account;
  selectedAccount: Account;
  @HostListener('window:focus', ['$event'])
  onFocus(event: FocusEvent): void {
    this.changeFavicon();
  }
  ngOnInit(): void {
    if (this.walletService.wallet) {
      this.init();
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  async init() {
    let pairingString = this.deeplinkService.popPairingJson();
    if (pairingString) {
      console.log(pairingString);
      if (pairingString.startsWith('wc')) {
        this.walletConnectService.pair(pairingString);
        pairingString = '';
      } else {
        this.beaconService.preNotifyPairing(pairingString);
      }
    }
    window.addEventListener('storage', (e) => {
      this.handleStorageEvent(e);
    });
    await this.connectApp().catch((error) => console.error('connect error', error));
    if (pairingString) {
      await this.beaconService.client.isConnected;
      this.beaconService.addPeer(pairingString);
    }
  }
  changeFavicon(active: boolean = false): void {
    if (active && document.hasFocus()) {
      active = false;
    }
    const src: string = active ? 'favicon-attention.ico' : 'favicon.ico';
    document.getElementById('favicon').setAttribute('href', src);
  }
  /* https://github.com/airgap-it/beacon-sdk/blob/master/src/clients/wallet-client/WalletClient.ts */
  connectApp = async (): Promise<void> => {
    if (!this.beaconService.client) {
      this.beaconService.client = new WalletClient({
        name: 'Kukai Wallet'
      });
    }
    await this.beaconService.client.init(); // Establish P2P connection
    this.beaconService.client
      .connect(async (message: any) => {
        this.handleBeaconMessage(message);
      })
      .catch((error) => console.error('connect error', error));
  };
  async handleBeaconMessage(message: any) {
    console.log('### beacon message', message);
    console.log(JSON.stringify(message));
    if (message.type !== BeaconMessageType.SignPayloadRequest && message.network.type !== CONSTANTS.NETWORK) {
      console.warn(`Rejecting Beacon message because of network. Expected ${CONSTANTS.NETWORK} instead of ${message.network.type}`);
      await this.beaconService.rejectOnNetwork(message);
    } else if (!this.isBlocked()) {
      switch (message.type) {
        case BeaconMessageType.PermissionRequest:
          await this.handlePermissionRequest(message);
          break;
        case BeaconMessageType.OperationRequest:
          if (await this.isSupportedOperationRequest(message)) {
            this.externalRequest = { operationRequest: message, selectedAccount: this.selectedAccount };
            this.changeFavicon(true);
          } else if (message?.version === 0) {
            console.error('Invalid request');
          }
          break;
        case BeaconMessageType.SignPayloadRequest:
          if (await this.isSupportedSignPayload(message)) {
            this.signRequest = message;
            this.changeFavicon(true);
          }
          break;
        default:
          await this.beaconService.rejectOnUnknown(message);
          console.warn('Unknown message type', message);
      }
    } else {
      console.warn('Blocked by other Beacon/Wc2 request');
      // need to reject instead of drop if WC2, in order to not block the new request queue
      if (message.version === 0) {
        console.log('reject wc2 req');
        if (message.type === 'permission_request') {
          this.walletConnectService.rejectPairing(message);
        } else {
          this.walletConnectService.wcResponse(message, '', false);
        }
      }
    }
  }
  private isBlocked() {
    return this.permissionRequest || this.externalRequest || this.signRequest;
  }
  async handlePermissionRequest(message: any): Promise<void> {
    console.log('## permission request');
    if (message.version) {
      message.scopes = message.scopes.filter((scope: PermissionScope) => [PermissionScope.OPERATION_REQUEST, PermissionScope.SIGN].includes(scope));
    }
    if (typeof message.scopes === 'object' || message.scopes.length) {
      if (this.walletService.wallet) {
        this.permissionRequest = message;
        this.changeFavicon(true);
      } else {
        console.warn('No wallet found');
        await this.beaconService.rejectOnSourceAddress(message);
      }
    } else {
      console.warn('No valid scope');
    }
  }
  async isSupportedOperationRequest(message: any): Promise<boolean> {
    try {
      if (!this.walletService.wallet) {
        console.log('No wallet found');
        await this.beaconService.rejectOnUnknown(message);
        return false;
      } else if (!this.walletService.wallet.getImplicitAccount(message.sourceAddress)) {
        console.warn('Source address not recogized');
        await this.beaconService.rejectOnSourceAddress(message);
        return false;
      } else if (message.operationDetails.length > 1) {
        for (const op of message.operationDetails) {
          if (op.kind !== 'transaction') {
            console.warn('Only transaction batches supported');
            await this.beaconService.rejectOnTooManyOps(message);
            return false;
          }
        }
      }
      if (message.operationDetails[0].kind === 'transaction') {
        for (let i = 0; i < message.operationDetails.length; i++) {
          if (
            message.operationDetails[i].destination &&
            message.operationDetails[i].parameters &&
            this.walletService.wallet.getAccount(message.operationDetails[i].destination)
          ) {
            console.warn('Invocation of user controlled contract is disabled');
            await this.beaconService.rejectOnPermission(message);
            return false;
          } else if (!message.operationDetails[i]?.destination) {
            console.warn('Missing destination');
            await this.beaconService.rejectOnUnknown(message);
            return false;
          } else if (this.invalidAmount(message.operationDetails[i])) {
            console.warn('Invalid amount');
            await this.beaconService.rejectOnUnknown(message);
            return false;
          } else if (this.invalidParameters(message.operationDetails[i].parameters)) {
            await this.beaconService.rejectOnParameters(message);
            return false;
          } else if (this.invalidOptionals(message.operationDetails[i])) {
            await this.beaconService.rejectOnParameters(message);
            return false;
          }
        }
      } else if (message.operationDetails[0].kind === 'delegation') {
        if (!message.operationDetails[0].delegate) {
          console.warn('Invalid delegate');
          await this.beaconService.rejectOnUnknown(message);
          return false;
        }
      } else if (message.operationDetails[0].kind === 'origination') {
        if (!message.operationDetails[0].script) {
          console.warn('No script found');
          await this.beaconService.rejectOnParameters(message);
          return false;
        } else if (this.invalidOptionals(message.operationDetails[0])) {
          await this.beaconService.rejectOnParameters(message);
          return false;
        }
      } else {
        console.warn('Unsupported operation kind');
        await this.beaconService.rejectOnUnknown(message);
        return false;
      }
      this.selectedAccount = this.walletService.wallet.getImplicitAccount(message.sourceAddress);
      return true;
    } catch (e) {
      if (e?.message === 'No matching request found!' && message.version === 0) {
        console.log('wc2');
        this.walletConnectService.wcResponse(message, '', false);
      } else {
        throw e;
      }
    }
    return false;
  }
  private invalidAmount(op: any): boolean {
    if (typeof op?.amount === 'number') {
      // normalize
      op.amount = op.amount.toString();
    }
    return !op?.amount || typeof op.amount !== 'string' || !this.inputValidationService.amount(op.amount, 0);
  }
  private invalidOptionals(op: any): boolean {
    if (typeof op.gas_limit === 'number') {
      // normalize
      op.gas_limit = op.gas_limit.toString();
    }
    if (typeof op.storage_limit === 'number') {
      op.storage_limit = op.storage_limit.toString();
    }
    if (op.gas_limit && (typeof op.gas_limit !== 'string' || !this.inputValidationService.amount(op.gas_limit, 0))) {
      return true;
    } else if (op.storage_limit && (typeof op.storage_limit !== 'string' || !this.inputValidationService.amount(op.storage_limit, 0))) {
      return true;
    }
    return false;
  }
  async isSupportedSignPayload(message: any): Promise<Boolean> {
    try {
      if (!this.walletService.wallet) {
        console.log('No wallet found');
        await this.beaconService.rejectOnUnknown(message);
        return false;
      } else if (!this.walletService.wallet.getImplicitAccount(message.sourceAddress)) {
        console.warn('Source address not recogized');
        await this.beaconService.rejectOnSourceAddress(message);
        return false;
      }
      if (message.payload.slice(0, 2) === '0x') {
        message.payload = message.payload.slice(2);
      }
      message.payload = message.payload.toLowerCase();
      const hexString = message.payload;
      console.log('hex', hexString);
      if ((message.signingType !== 'raw' && message.signingType !== 'micheline') || !this.inputValidationService.hexString(hexString)) {
        console.warn('Invalid sign payload');
        await this.beaconService.rejectOnUnknown(message);
        return false;
      } else if (!['05', '80'].includes(hexString.slice(0, 2))) {
        console.warn('Unsupported prefix:' + hexString.slice(0, 2));
        await this.beaconService.rejectOnUnknown(message);
        return false;
      }
      if (hexString.slice(0, 2) === '05' && !this.inputValidationService.isMichelineExpr(hexString)) {
        await this.beaconService.rejectOnUnknown(message);
        return false;
      }
      this.selectedAccount = this.walletService.wallet.getImplicitAccount(message.sourceAddress);
      return true;
    } catch (e) {
      if (e?.message === 'No matching request found!' && message.version === 0) {
        console.log('wc2');
        this.walletConnectService.wcResponse(message, '', false);
      } else {
        throw e;
      }
    }
    return false;
  }
  invalidParameters(parameters: any): boolean {
    try {
      if (parameters) {
        if (!parameters.value || !parameters.entrypoint) {
          throw new Error('entrypoint and value expected');
        }
        assertMichelsonData(parameters.value);
      }
      return false;
    } catch (e) {
      return true;
    }
  }
  /* operation request handling */
  async operationResponse(opHash: any): Promise<void> {
    if (opHash?.error) {
      opHash = opHash.error;
    }
    if (!this.externalRequest) {
      return;
    }
    console.log('hash', opHash);
    console.log('externalRequest', this.externalRequest);
    if (this.externalRequest.operationRequest.version) {
      if (!opHash) {
        await this.beaconService.rejectOnUserAbort(this.externalRequest.operationRequest);
      } else if (opHash === 'broadcast_error') {
        await this.beaconService.rejectOnBroadcastError(this.externalRequest.operationRequest);
      } else if (opHash === 'invalid_parameters') {
        await this.beaconService.rejectOnParameters(this.externalRequest.operationRequest);
      } else if (opHash === 'parameters_error') {
        await this.beaconService.rejectOnParameters(this.externalRequest.operationRequest);
      } else if (opHash === 'unknown_error') {
        await this.beaconService.rejectOnUnknown(this.externalRequest.operationRequest);
      } else if (opHash !== 'silent') {
        const response: OperationResponseInput = {
          type: BeaconMessageType.OperationResponse,
          transactionHash: opHash,
          id: this.externalRequest.operationRequest.id
        };
        await this.beaconService.client.respond(response);
      }
    } else if (this.externalRequest.operationRequest.version === 0) {
      if (opHash?.length > 50) {
        this.walletConnectService.wcResponse(this.externalRequest.operationRequest, opHash, true);
      } else if (opHash !== 'silent') {
        this.walletConnectService.wcResponse(this.externalRequest.operationRequest, opHash, false);
      }
    }
    if (opHash !== 'silent') {
      this.beaconService.responseSync();
    }
    this.externalRequest = null;
  }
  /* permission handling */
  async permissionResponse(publicKey: string): Promise<void> {
    if (this.permissionRequest.version) {
      // Beacon
      if (!publicKey) {
        this.beaconService.rejectOnUserAbort(this.permissionRequest);
      } else if (publicKey !== 'silent') {
        this.beaconService.approvePermissionRequest(this.permissionRequest, publicKey).then(() => {
          this.beaconService.syncBeaconState();
        });
      }
    } else {
      // Wallet Connect 2
      if (!publicKey) {
        this.walletConnectService.rejectPairing(this.permissionRequest);
      } else if (publicKey !== 'silent') {
        this.walletConnectService.approvePairing(this.permissionRequest, publicKey);
      }
    }
    this.beaconService.responseSync();
    this.permissionRequest = null;
  }
  /* sign payload handling */
  async signResponse(signature: string): Promise<void> {
    if (this.signRequest.version) {
      if (!signature) {
        await this.beaconService.rejectOnUserAbort(this.signRequest);
      } else if (signature !== 'silent') {
        await this.beaconService.approveSignPayloadRequest(this.signRequest, signature);
      }
    } else if (this.signRequest.version === 0) {
      if (signature) {
        this.walletConnectService.wcResponse(this.signRequest, signature, true);
      } else {
        this.walletConnectService.wcResponse(this.signRequest, signature, false);
      }
    }
    this.beaconService.responseSync();
    console.log(signature);
    this.signRequest = null;
  }
  private async handleStorageEvent(ev: StorageEvent): Promise<void> {
    switch (ev.key) {
      case 'beacon:communication-peers-wallet':
        const peers = JSON.parse(ev.newValue);
        const senderIds = (await this.beaconService.client.getAppMetadataList()).map((app) => {
          return app.senderId;
        });
        const newPeers = peers.length - senderIds.length;
        if (newPeers > 0) {
          const newPeer = peers ? peers.pop() : null;
          if (newPeer && !senderIds.includes(newPeer.senderId)) {
            const { senderId, ...peer } = newPeer;
            await this.beaconService.addPeer(JSON.stringify(peer), false);
          }
        } else {
          this.beaconService.syncBeaconState();
        }
        break;
      case 'beacon:request-response':
        if (ev.newValue) {
          this.subjectService.beaconResponse.next(true);
          this.beaconService.syncBeaconState();
          this.changeFavicon();
        }
        break;
    }
  }
}
