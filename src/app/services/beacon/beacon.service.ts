import { Injectable } from '@angular/core';
import { MessageService } from '../../services/message/message.service';
import {
  WalletClient,
  BeaconMessageType,
  PermissionResponseInput,
  SignPayloadResponseInput,
  P2PPairingRequest,
  BeaconErrorType,
  BEACON_VERSION,
  ErrorResponse,
  getSenderId,
  ExtendedP2PPairingResponse
} from '@airgap/beacon-sdk';
import { Asset } from '../token/token.service';
import { TzktService } from '../indexer/tzkt/tzkt.service';
import { BcService } from '../bc/bc.service';
import { CONSTANTS, environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class BeaconService {
  pairingTimeoutSignal = 10000;
  client: WalletClient = null;
  peers = [];
  permissions = [];
  constructor(private messageService: MessageService, private tzktService: TzktService, private bcService: BcService) {
    this.gcDict();
  }
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
    this.pairingLogStart(pairInfo);
    await this.client.addPeer(pairInfo, force);
    this.syncBeaconState();
    this.messageService.removeBeaconMsg();
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
      walletType: 'implicit',
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
  async pairingLogStart(pairInfo: any) {
    try {
      const id = await getSenderId(pairInfo.publicKey);
      const dapp = pairInfo.appUrl;
      const relay = pairInfo.relayServer;
      let dict: any = this.getDict();
      const ts = Date.now();
      if (!dict[id]) {
        dict[id] = { ts, dapp, relay };
      }
      this.setDict(dict);
      setTimeout(() => {
        this.pairingLogEnd(id, true);
      }, this.pairingTimeoutSignal);
    } catch (e) {
      console.error(e);
    }
  }
  async pairingLogEnd(id: string, timeout = false) {
    try {
      const ts = Date.now();
      await this.bcService.elected;
      const dict = this.getDict();
      if (dict[id]) {
        const diff = ts - dict[id].ts;
        const event: { ts: number; dapp: string; relay: string } = dict[id];
        if (!timeout) {
          delete dict[id];
          this.setDict(dict);
        }
        this.reportDiff(event.dapp, event.ts, event.relay, timeout ? this.pairingTimeoutSignal : diff, timeout, id);
      }
    } catch (e) {
      console.error(e);
    }
  }
  getDict(): any {
    let dict: any = localStorage.getItem('pairing-dict');
    dict = dict ? JSON.parse(dict) : {};
    return dict;
  }
  setDict(dict: any) {
    localStorage.setItem('pairing-dict', JSON.stringify(dict));
  }
  gcDict() {
    try {
      const dict = this.getDict();
      if (dict) {
        const keys = Object.keys(dict);
        if (keys?.length) {
          let deleted = false;
          for (const key of keys) {
            if (Date.now() - dict[key].ts > 3600000) {
              // 1 hour
              delete dict[key];
              deleted = true;
            }
          }
          deleted ? this.setDict(dict) : null;
        }
      }
    } catch (e) {
      console.error();
    }
  }
  async reportDiff(url: string, t0: number, relay: string, rtt: number, timeout: boolean, senderId: string) {
    console.log('reportDiff', senderId, t0, timeout, url, rtt);
    const sn = localStorage.getItem('beacon:matrix-selected-node');
    console.log(sn, '=>', relay);
    const eventUrl = `https://services.kukai.app/v1/events/?eventId=pair-time-v2&id=${senderId}-${t0}&timeout=${timeout}&url=${encodeURIComponent(
      url
    )}&walletRelay=${encodeURIComponent(sn)}&dappRelay=${encodeURIComponent(relay)}&rtt=${rtt}`;
    if (environment?.production) {
      fetch(eventUrl);
    }
  }
}
