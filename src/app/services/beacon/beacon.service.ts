import { Injectable } from '@angular/core';
import { MessageService } from '../../services/message/message.service';
import { BEACON_VERSION } from '@airgap/beacon-sdk/dist/constants';
import { WalletClient, BeaconMessageType, PermissionScope, PermissionResponseInput, P2PPairInfo, BeaconErrorType, BeaconResponseInputMessage, BeaconMessage, OperationResponseInput } from '@airgap/beacon-sdk';

@Injectable({
  providedIn: 'root'
})
export class BeaconService {
  client = null;
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
  async addPeer(pairInfoJson: string) {
    // await this.client.removeAllPeers();
    const pairInfo: P2PPairInfo = JSON.parse(pairInfoJson);
    console.log('PairInfo', pairInfo);
    this.client.addPeer(pairInfo);
    this.messageService.addSuccess(`Pairing with ${pairInfo.name}...`);
  }
  async removePeers() {
    await this.client.removeAllPeers();
  }
  async removePermissions() {
    await this.client.removeAllPermissions();
  }
  async getPeers(): Promise<any> {
    return await this.client.getPeers();
  }
  async getPermissions(): Promise<any> {
    return await this.client.getPermissions();
  }
  async respondWithError(errorType: string, requestMessage: any) {
    if (requestMessage) {
      const error: any = {
        id: requestMessage.id,
        type: errorType,
        errorType: BeaconErrorType.NOT_GRANTED_ERROR
      };
      const response: BeaconResponseInputMessage = {
        beaconId: await this.client.beaconId,
        version: BEACON_VERSION,
        ...error
      };
      await this.client.respond(response);
    }
  }
  registerURIhandler() {
    navigator.registerProtocolHandler('web+tezos', `${window.location.origin}/accounts/%s`, 'Kukai'); // web+tezos://?type=tzip10&data=<data>
    console.log(`${window.location.origin}/accounts/<payload>`);
  }
}
