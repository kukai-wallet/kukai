import { Injectable } from '@angular/core';
import { MessageService } from '../../services/message/message.service';
import { WalletClient, BeaconMessageType, PermissionResponseInput, SignPayloadResponseInput, P2PPairingRequest, BeaconErrorType, BEACON_VERSION, ErrorResponse, getSenderId } from '@airgap/beacon-sdk';
import { ExtendedP2PPairingResponse } from '@airgap/beacon-sdk/dist/cjs/types/P2PPairingResponse';
import { Asset } from '../token/token.service';
import { TzktService } from '../indexer/tzkt/tzkt.service';
@Injectable({
  providedIn: 'root'
})
export class BeaconService {
  client: WalletClient = null;
  peers = [];
  permissions = [];
  constructor(
    private messageService: MessageService,
    private tzktService: TzktService
  ) {}
  preNotifyPairing(pairInfoJson: string) {
    const pairInfo: P2PPairingRequest = JSON.parse(pairInfoJson);
    if (this.isNewPairingRequest(pairInfo)) {
      this.messageService.addBeaconWait(`Pairing with ${pairInfo.name}. Please wait!`);
    }
  }
  isNewPairingRequest(pairInfo: P2PPairingRequest): boolean {
    const peersJson = localStorage.getItem('beacon:communication-peers-wallet');
    let newPublicKey = true;
    if (peersJson) {
      const peers = JSON.parse(peersJson);
      if (peers && peers.length > 0 && pairInfo.publicKey) {
        for (const peer of peers) {
          if (peer.publicKey && peer.publicKey === pairInfo.publicKey) {
            newPublicKey = false;
            console.log('Existing public key found!');
            break;
          }
        }
      }
    }
    return newPublicKey;
  }
  async addPeer(pairInfoJson: string, force = true) {
    const pairInfo = JSON.parse(pairInfoJson);
    console.log('PairInfo', pairInfo);
    await this.client.addPeer(pairInfo, force);
    this.syncBeaconState();
    this.messageService.removeBeaconMsg();
    if (pairInfo.icon && pairInfo.icon.startsWith('https://')) {
      this.cacheIcon(pairInfo);
    }
  }
  async cacheIcon(pairInfo: any) {
    const key = 'beacon:communication-peers-wallet';
    const asset: Asset = await this.tzktService.fetchApi(`https://backend.kukai.network/file/info?src=${pairInfo.icon}`);
    const json = localStorage.getItem(key);
    if (!json || !asset) { return; }
    const peers = JSON.parse(json);
    if (peers) {
      for (const peer of peers) {
        if (peer.icon === pairInfo.icon) {
          peer.cachedIcon = asset;
          break;
        }
      }
      localStorage.setItem(key, JSON.stringify(peers))
      this.syncBeaconState();
    }
  }
  async syncBeaconState() {
    this.peers = await this.getPeers();
    this.permissions = await this.getPermissions();
  }
  async removePeers() {
    while (this.peers.length > 0) {
      await this.removePeer(0);
    }
  }
  async removePeer(index: number) {
    const pairInfo: P2PPairingRequest = this.peers[index];
    const senderId = await getSenderId(pairInfo.publicKey);
    const peerResponse: ExtendedP2PPairingResponse = {
      ...pairInfo,
      type: 'p2p-pairing-response',
      senderId
    };
    await this.client.removePeer(peerResponse);
    await this.client.removeAppMetadata(senderId);
    this.syncBeaconState();
  }
  async removePermissions() {
    await this.client.removeAllPermissions();
    this.syncBeaconState();
  }
  async removePermission(index: number) {
    await this.client.removePermission(this.permissions[index].accountIdentifier);
    this.syncBeaconState();
  }
  async getPeers(): Promise<any> {
    return await this.client.getPeers();
  }
  async getPermissions(): Promise<any> {
    return await this.client.getPermissions();
  }
  async getAppMetadataList(): Promise<any> {
    return await this.client.getAppMetadataList();
  }
  async rejectOnPermission(message: any) {
    await this.respondWithError(BeaconErrorType.NOT_GRANTED_ERROR, message);
  }
  async rejectOnNetwork(message: any) {
    await this.respondWithError(BeaconErrorType.NETWORK_NOT_SUPPORTED, message);
  }
  async rejectOnUserAbort(message: any) {
    await this.respondWithError(BeaconErrorType.ABORTED_ERROR, message);
  }
  async rejectOnSourceAddress(message: any) {
    await this.respondWithError(BeaconErrorType.NO_PRIVATE_KEY_FOUND_ERROR, message);
  }
  async rejectOnTooManyOps(message: any) {
    await this.respondWithError(BeaconErrorType.TOO_MANY_OPERATIONS, message);
  }
  async rejectOnUnknown(message: any) {
    await this.respondWithError(BeaconErrorType.UNKNOWN_ERROR, message);
  }
  async rejectOnParameters(message: any) {
    await this.respondWithError(BeaconErrorType.PARAMETERS_INVALID_ERROR, message);
  }
  async rejectOnBroadcastError(message: any) {
    await this.respondWithError(BeaconErrorType.BROADCAST_ERROR, message);
  }
  async respondWithError(errorType: BeaconErrorType, requestMessage: any) {
    if (requestMessage) {
      const response: ErrorResponse = {
        type: BeaconMessageType.Error,
        errorType,
        version: BEACON_VERSION,
        id: requestMessage.id,
        senderId: await this.client.beaconId
      };
      await this.client.respond(response);
    }
  }
  async approvePermissionRequest(message: any, publicKey: string) {
    const response: PermissionResponseInput = {
      type: BeaconMessageType.PermissionResponse,
      network: message.network,
      scopes: message.scopes,
      id: message.id,
      publicKey: publicKey
    };
    await this.client.respond(response);
  }
  async approveSignPayloadRequest(message: any, signature: string) {
    const response: SignPayloadResponseInput = {
      type: BeaconMessageType.SignPayloadResponse,
      id: message.id,
      signingType: message.signingType,
      signature
    };
    await this.client.respond(response);
  }
  async responseSync() {
    localStorage.setItem('beacon:request-response', 'true');
    localStorage.removeItem('beacon:request-response');
  }
}