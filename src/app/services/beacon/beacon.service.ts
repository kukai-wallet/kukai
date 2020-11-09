import { Injectable } from '@angular/core';
import { MessageService } from '../../services/message/message.service';
import { WalletClient, BeaconMessageType, PermissionScope, PermissionResponseInput, P2PPairingRequest, BeaconErrorType, BeaconResponseInputMessage, BeaconMessage, OperationResponseInput, BEACON_VERSION } from '@airgap/beacon-sdk';

@Injectable({
  providedIn: 'root'
})
export class BeaconService {
  client = null;
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
      this.messageService.add(`Pairing with ${pairInfo.name}...`);
    }
  }
  async addPeer(pairInfoJson: string) {
    const pairInfo: P2PPairingRequest = JSON.parse(pairInfoJson);
    console.log('PairInfo', pairInfo);
    await this.client.addPeer(pairInfo);
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
    await this.client.removePeer(pairInfo);
    await this.client.removeAppMetadata(pairInfo.publicKey);
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
  async rejectOnSourceAddress(message: any) {
    await this.respondWithError(BeaconErrorType.NO_PRIVATE_KEY_FOUND_ERROR, message);
  }
  async rejectOnTooManyOps(message: any) {
    await this.respondWithError(BeaconErrorType.TOO_MANY_OPERATIONS, message);
  }
  async rejectOnUnknown(message: any) {
    await this.respondWithError(BeaconErrorType.UNKNOWN_ERROR, message);
  }
  async respondWithError(errorType: BeaconErrorType, requestMessage: any) {
    if (requestMessage) {
      const error: any = {
        id: requestMessage.id,
        type: this.correspondingResponseType[requestMessage.type],
        errorType
      };
      const response: BeaconResponseInputMessage = {
        beaconId: await this.client.beaconId,
        version: BEACON_VERSION,
        ...error
      };
      await this.client.respond(response);
    }
  }
  async approvePermissionRequest(message: any, publicKey: string) {
    const response: PermissionResponseInput = {
      type: BeaconMessageType.PermissionResponse,
      network: message.network, // Use the same network that the user requested
      scopes: [PermissionScope.OPERATION_REQUEST], //NOT_GRANTED_ERROR
      id: message.id,
      publicKey: publicKey
    };
    await this.client.respond(response);
  }
  async rejectPermissionRequest(message: any) {
    await this.respondWithError(BeaconErrorType.NOT_GRANTED_ERROR, message);
  }
}
