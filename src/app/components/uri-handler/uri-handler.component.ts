import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message/message.service';
import { WalletClient, BeaconMessageType, PermissionScope, PermissionResponseInput, P2PPairingRequest, BeaconErrorType, BeaconResponseInputMessage, BeaconMessage, OperationResponseInput } from '@airgap/beacon-sdk';
import { WalletService } from '../../services/wallet/wallet.service';
import { CONSTANTS } from '../../../environments/environment';
import { Account, ImplicitAccount, OriginatedAccount } from '../../services/wallet/wallet';
import { Location } from '@angular/common';
import { BeaconService } from '../../services/beacon/beacon.service';
import { DeeplinkService } from '../../services/deeplink/deeplink.service';
import { emitMicheline, assertMichelsonData } from '@taquito/michel-codec';
import { valueDecoder } from '@taquito/local-forging/dist/lib/michelson/codec';
import { Uint8ArrayConsumer } from '@taquito/local-forging/dist/lib/uint8array-consumer';
import { InputValidationService } from '../../services/input-validation/input-validation.service';
import Big from 'big.js';
import { PartiallyPreparedTransaction } from '../send/interfaces';

@Component({
  selector: 'app-uri-handler',
  templateUrl: './uri-handler.component.html',
  styleUrls: ['./uri-handler.component.scss']
})
export class UriHandlerComponent implements OnInit {
  permissionRequest: PermissionResponseInput = null;
  operationRequest: any = null;
  signRequest: any = null;
  activeAccount: Account;
  constructor(
    private route: ActivatedRoute,
    public messageService: MessageService,
    public walletService: WalletService,
    private location: Location,
    private beaconService: BeaconService,
    private deeplinkService: DeeplinkService,
    private inputValidationService: InputValidationService
  ) { }
  ngOnInit(): void {
    if (this.walletService.wallet) {
      this.init();
    }
  }
  async init() {
    const pairingString = this.deeplinkService.popPairingJson();
    if (pairingString) {
      console.log(pairingString);
      this.beaconService.preNotifyPairing(pairingString);
    }
    await this.connectApp().catch((error) => console.error('connect error', error));
    if (pairingString) {
      await this.beaconService.client.isConnected;
      this.beaconService.addPeer(pairingString);
    }
  }
  /* https://docs.walletbeacon.io/beacon/03.getting-started-wallet.html#setup */
  connectApp = async (): Promise<void> => {
    if (!this.beaconService.client) {
      this.beaconService.client = new WalletClient({ name: 'Kukai Wallet' });
    }
    await this.beaconService.client.init(); // Establish P2P connection
    this.beaconService.client
      .connect(async (message: any) => {
        console.log('### beacon message', message);
        if (message?.network?.name === 'edonet giganode' && message.network.type === 'custom') {
          message.network.type = 'edonet';
        }
        if (message.type !== BeaconMessageType.SignPayloadRequest && message.network.type !== CONSTANTS.NETWORK) {
          console.warn(`Rejecting Beacon message because of network. Expected ${CONSTANTS.NETWORK} instead of ${message.network.type}`, message);
          await this.beaconService.rejectOnNetwork(message);
        } else if (!this.permissionRequest && !this.operationRequest && !this.signRequest) {
          switch (message.type) {
            case BeaconMessageType.PermissionRequest:
              await this.handlePermissionRequest(message);
              break;
            case BeaconMessageType.OperationRequest:
              if (await this.isSupportedOperationRequest(message)) {
                this.operationRequest = message;
              } else {
                await this.beaconService.rejectOnUnknown(message);
              }
              break;
            case BeaconMessageType.SignPayloadRequest:
              if (await this.isSupportedSignPayload(message)) {
                this.signRequest = message;
              } else {
                await this.beaconService.rejectOnUnknown(message);
              }
              break;
            default:
              await this.beaconService.rejectOnUnknown(message);
              console.warn('Unknown message type', message);
          }
        } else {
          console.log('Blocked by other Beacon request');
        }
      })
      .catch((error) => console.error('connect error', error));
  }
  async handlePermissionRequest(message: any) {
    console.log('## permission request');
    message.scopes = message.scopes.filter((scope: PermissionScope) => [PermissionScope.OPERATION_REQUEST, PermissionScope.SIGN].includes(scope));
    if (message.scopes.length) {
      if (this.walletService.wallet) {
        this.permissionRequest = message;
      } else {
        console.warn('No wallet found');
        await this.beaconService.rejectOnSourceAddress(message);
      }
    } else {
      console.warn('No valid scope');
    }
  }
  async isSupportedOperationRequest(message: any): Promise<boolean> {
    if (!this.walletService.wallet) {
      console.log('No wallet found');
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
        if (message.operationDetails[i].destination &&
          message.operationDetails[i].parameters &&
          this.walletService.wallet.getAccount(message.operationDetails[i].destination)) {
          console.warn('Invocation of user controlled contract is disabled');
          await this.beaconService.rejectOnPermission(message);
          return false;
        } else if (
          !message.operationDetails[i].destination ||
          !message.operationDetails[i].amount
        ) {
          console.warn('Missing destination or amount');
          await this.beaconService.rejectOnUnknown(message);
          return false;
        } else if (this.invalidParameters(message.operationDetails[i].parameters)) {
          await this.beaconService.rejectOnParameters(message);
          return false;
        }
      }
    } else if (message.operationDetails[0].kind === 'delegation') {
      if (!message.operationDetails[0].delegate) {
        console.warn('Invalid delegate');
        await this.beaconService.rejectOnUnknown(message);
      }
    } else {
      console.warn('Unsupported operation kind');
      await this.beaconService.rejectOnUnknown(message);
      return false;
    }
    this.activeAccount = this.walletService.wallet.getImplicitAccount(message.sourceAddress);
    return true;
  }
  async isSupportedSignPayload(message: any): Promise<Boolean> {
    if (!this.walletService.wallet) {
      console.log('No wallet found');
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
    } else if (hexString.slice(0, 2) !== '05') {
      console.warn('Unsupported prefix (expected 05)');
      await this.beaconService.rejectOnUnknown(message);
      return false;
    }
    try {
      const parsedPayload = valueDecoder(Uint8ArrayConsumer.fromHexString(hexString.slice(2)));
      console.log('Parsed sign payload', parsedPayload);
    } catch (e) {
      console.warn(e.message ? 'Decoding: ' + e.message : e);
      await this.beaconService.rejectOnUnknown(message);
      return false;
    }
    this.activeAccount = this.walletService.wallet.getImplicitAccount(message.sourceAddress);
    return true;
  }
  invalidParameters(parameters: any): boolean {
    try {
      if (parameters) {
        if (!parameters.value ||
          !parameters.entrypoint) {
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
  async operationResponse(opHash: any) {
    if (!opHash) {
      await this.beaconService.rejectOnUserAbort(this.operationRequest);
    } else if (opHash === 'broadcast_error') {
      await this.beaconService.rejectOnBroadcastError(this.operationRequest);
    } else if (opHash === 'invalid_parameters') {
      await this.beaconService.rejectOnParameters(this.operationRequest);
    } else {
      const response: OperationResponseInput = {
        type: BeaconMessageType.OperationResponse,
        transactionHash: opHash,
        id: this.operationRequest.id
      };
      await this.beaconService.client.respond(response);
    }
    this.operationRequest = null;
  }
  /* permission handling */
  async permissionResponse(publicKey: string) {
    if (!publicKey) {
      await this.beaconService.rejectOnUserAbort(this.permissionRequest);
    } else {
      await this.beaconService.approvePermissionRequest(this.permissionRequest, publicKey);
      this.beaconService.syncBeaconState();
    }
    this.permissionRequest = null;
  }
  /* sign payload handling */
  async signResponse(signature: string) {
    if (!signature) {
      await this.beaconService.rejectOnUserAbort(this.signRequest);
    } else {
      await this.beaconService.approveSignPayloadRequest(this.signRequest, signature);
    }
    console.log(signature);
    this.signRequest = null;
  }
}
