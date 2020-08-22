import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message/message.service';
import { WalletClient, BeaconMessageType, PermissionScope, PermissionResponseInput, P2PPairInfo, BeaconErrorType, BeaconResponseInputMessage, BeaconMessage, OperationResponseInput } from '@airgap/beacon-sdk';
import { WalletService } from '../../services/wallet/wallet.service';
import { Constants } from '../../constants';
import { Account, ImplicitAccount, OriginatedAccount } from '../../services/wallet/wallet';
import { Location } from '@angular/common';
import * as Bs58check from 'bs58check';
import { BeaconService } from '../../services/beacon/beacon.service';

@Component({
  selector: 'app-uri-handler',
  templateUrl: './uri-handler.component.html',
  styleUrls: ['./uri-handler.component.scss']
})
export class UriHandlerComponent implements OnInit, OnDestroy {
  CONSTANTS = new Constants();
  permissionRequest: PermissionResponseInput = null;
  operationRequest: any = null;
  activeAccount: Account;
  constructor(
    private route: ActivatedRoute,
    public messageService: MessageService,
    public walletService: WalletService,
    private location: Location,
    private beaconService: BeaconService
  ) { }
  ngOnInit(): void {
    if (this.walletService.wallet) {
      this.init();
    }
  }
  async init() {
    await this.connectApp().catch((error) => console.error('connect error', error));
    const path = this.location.path();
    console.log(path);
    console.log(window.location.origin);
    if (path && path.length > 10 && path.slice(0, 10) === '/accounts/') {
      let uri = path.slice(10);
      uri = decodeURI(uri).replace(/%2F|%3F/g, '');
      console.log(uri.slice(0, 12));
      if (uri.length > 12 && uri.slice(0, 12) === 'web%2Btezos:') {// Correct prefix
        const rest = uri.slice(12).split(/\&|%3D/g);
        console.log(rest);
        if (rest.length === 4 && (rest[0] + rest[1] + rest[2]) === 'typetzip10data') { // Tzip-10
          console.log(rest[3]);
          const base58encoded = rest[3];
          const base58decoded = Bs58check.decode(base58encoded);
          console.log(base58decoded.toString());
          console.log('Connected?');
          await this.beaconService.client.isConnected;
          console.log('Connected!!!');
          this.beaconService.addPeer(base58decoded.toString());
          this.location.replaceState('/accounts');
        } else {
          console.warn('Unsupported URI format');
        }
      } else {
        console.log(`${uri}`);
      }
    }
  }
  ngOnDestroy() {
    // Figure out how to disconnect from the p2p network
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

        // Let's assume it's a permission request, but we obviously need to handle all request types
        if (message.network.type !== this.CONSTANTS.NET.NETWORK && false) { // Todo: remove false
          console.warn(`Rejecting Beacon message because of network. Expected ${this.CONSTANTS.NET.NETWORK} instead of ${message.network.type}`);
          await this.beaconService.rejectOnNetwork(message);
        } else if (!this.permissionRequest && !this.operationRequest) {
          if (message.type === BeaconMessageType.PermissionRequest) {
            console.log('## permission request');
            if (message.scopes.includes(PermissionScope.OPERATION_REQUEST)) {
              if (this.walletService.wallet) {
                this.permissionRequest = message;
              } else {
                console.warn('No wallet found');
                await this.beaconService.rejectOnSourceAddress(message);
              }
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
      await this.beaconService.rejectOnToManyOps(message);
      return false;
    }

    if (message.operationDetails[0].kind === 'transaction') {
      if (message.operationDetails[0].destination &&
        message.operationDetails[0].parameters &&
        this.walletService.wallet.getAccount(message.operationDetails[0].destination)) {
        console.warn('Invocation of user controlled contract is disabled');
        await this.beaconService.rejectOnPermission(message);
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
  /* operation request handling */
  async operationResponse(opHash: any) {
    if (!opHash) {
      await this.beaconService.rejectOnPermission(this.operationRequest);
    } else {
      const response: OperationResponseInput = {
        type: BeaconMessageType.OperationResponse,
        transactionHash: opHash,
        id: this.operationRequest.id
      };
      await this.beaconService.client.respond(response);
      console.log(response);
    }
    console.log(this.operationRequest);
    this.operationRequest = null;
  }
  /* permission handling */
  async permissionResponse(publicKey: string) {
    if (!publicKey) {
      await this.beaconService.rejectPermissionRequest(this.permissionRequest);
    } else {
      await this.beaconService.approvePermissionRequest(this.permissionRequest, publicKey);
      this.beaconService.syncBeaconState();
    }
    this.permissionRequest = null;
  }
}
