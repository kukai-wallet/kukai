import { Injectable } from '@angular/core';
import { MessageService } from '../../services/message/message.service';
import { WalletClient, BeaconMessageType, PermissionResponseInput, P2PPairingRequest, BeaconErrorType, BEACON_VERSION, ErrorResponse, getSenderId } from '@airgap/beacon-sdk';
import { ExtendedP2PPairingResponse } from '@airgap/beacon-sdk/dist/cjs/types/P2PPairingResponse';

@Injectable({
  providedIn: 'root'
})
export class BeaconService {
  client: WalletClient = null;
  peers = [];
  permissions = [];
  constructor(
    private messageService: MessageService
  ) {
    console.log('### BEACON SERVICE ###');
  }
  correspondingResponseType: Record<string, string> = {
    'permission_request': 'permission_response',
    'operation_request': 'operation_response',
    'sign_payload_request': 'sign_payload_response',
    'broadcast_request': 'broadcast_response'
  };
  preNotifyPairing(pairInfoJson: string) {
    const pairInfo: P2PPairingRequest = JSON.parse(pairInfoJson);
    const peersJson = localStorage.getItem('beacon:communication-peers');
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
    if (newPublicKey) {
      this.messageService.addBeaconWait(`Pairing with ${pairInfo.name}. Please wait!`);
    }
  }
  async addPeer(pairInfoJson: string) {
    const pairInfo: P2PPairingRequest = JSON.parse(pairInfoJson);
    console.log('PairInfo', pairInfo);
    await this.client.addPeer(pairInfo);
    this.messageService.removeBeaconMsg();

  }
  async syncBeaconState() {
    this.peers = await this.getPeers();
    this.permissions = await this.getPermissions();
  }
  async removePeers() {
    await this.client.removeAllPeers();
    await this.client.removeAllAppMetadata();
    this.syncBeaconState();
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
}
