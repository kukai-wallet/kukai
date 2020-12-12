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

@Component({
  selector: 'app-uri-handler',
  templateUrl: './uri-handler.component.html',
  styleUrls: ['./uri-handler.component.scss']
})
export class UriHandlerComponent implements OnInit {
  permissionRequest: PermissionResponseInput = null;
  operationRequest: any = null;
  activeAccount: Account;
  constructor(
    private route: ActivatedRoute,
    public messageService: MessageService,
    public walletService: WalletService,
    private location: Location,
    private beaconService: BeaconService,
    private deeplinkService: DeeplinkService
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
      this.beaconService.client = new WalletClient({ name: 'Kukai' });
    }
    await this.beaconService.client.init(); // Establish P2P connection
    this.beaconService.client
      .connect(async (message: any) => {
        console.log('### beacon message', message);
        if (message.network.type !== CONSTANTS.NETWORK) {
          console.warn(`Rejecting Beacon message because of network. Expected ${CONSTANTS.NETWORK} instead of ${message.network.type}`);
          await this.beaconService.rejectOnNetwork(message);
        } else if (!this.permissionRequest && !this.operationRequest) {
          if (message.type === BeaconMessageType.PermissionRequest) {
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
          } else if (message.type === BeaconMessageType.OperationRequest) {
            if (await this.isSupportedOperationRequest(message)) {
              console.log('supported operation request');
              this.operationRequest = message;
            }
            console.log(message);
          } else {
            console.warn(message);
          }
        }
      })
      .catch((error) => console.error('connect error', error));
  }
  async isSupportedOperationRequest(message: any): Promise<boolean> {
    if (!this.walletService.wallet || !this.walletService.wallet.getImplicitAccount(message.sourceAddress)) {
      console.warn('Source address not recogized');
      await this.beaconService.rejectOnSourceAddress(message);
      return false;
    } else if (message.operationDetails.length > 1) {
      console.warn('Multiple operations currently not supported in requests');
      await this.beaconService.rejectOnTooManyOps(message);
      return false;
    }

    if (message.operationDetails[0].kind === 'transaction') {
      if (message.operationDetails[0].destination &&
        message.operationDetails[0].parameters &&
        this.walletService.wallet.getAccount(message.operationDetails[0].destination)) {
        console.warn('Invocation of user controlled contract is disabled');
        await this.beaconService.rejectOnPermission(message);
        return false;
      } else if (this.invalidParameters(message.operationDetails[0].parameters)) {
        await this.beaconService.rejectOnParameters(message);
        return false;
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
    } else {
      const response: OperationResponseInput = {
        type: BeaconMessageType.OperationResponse,
        transactionHash: opHash,
        id: this.operationRequest.id
      };
      await this.beaconService.client.respond(response);
      console.log(response);
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
}
