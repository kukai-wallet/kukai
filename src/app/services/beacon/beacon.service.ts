import { Injectable } from '@angular/core';
import { MessageService } from '../../services/message/message.service';
import {
  WalletClient,
  BeaconErrorType,
  P2PPairingRequest,
  getSenderId,
  ExtendedPeerInfo,
  PermissionInfo,
  AppMetadata,
  PermissionRequestOutput,
  OperationRequestOutput,
  SignPayloadRequestOutput
} from '@ecadlabs/beacon-sdk';
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
  peers: ExtendedPeerInfo[] = [];
  permissions: PermissionInfo[] = [];
  private clientUnsubscribers: Array<() => void> = [];
  constructor(private messageService: MessageService, private tzktService: TzktService, private bcService: BcService) {
    this.gcDict();
  }
  ensureClient(): WalletClient {
    if (!this.client) {
      this.client = new WalletClient({
        name: 'Kukai Wallet'
      });
      this.subscribeToClientEvents();
    }
    return this.client;
  }
  subscribeToClientEvents(): void {
    this.clearClientSubscriptions();
    if (!this.client) {
      return;
    }
    this.clientUnsubscribers.push(
      this.client.subscribeToPeers((event) => {
        if (event.type === 'peer_added' && event.source === 'storage') {
          if (event.peer) {
            this.pairingLogStart(event.peer);
          }
          this.messageService.removeBeaconMsg();
        }
        this.syncBeaconState();
      }),
      this.client.subscribeToPermissions((permissions: PermissionInfo[]) => {
        this.permissions = permissions;
      }),
      this.client.subscribeToDisconnect(() => {
        this.syncBeaconState();
      })
    );
  }
  clearClientSubscriptions(): void {
    for (const unsub of this.clientUnsubscribers) {
      unsub();
    }
    this.clientUnsubscribers = [];
  }
  async preNotifyPairing(pairInfoJson: string) {
    const pairInfo: P2PPairingRequest = JSON.parse(pairInfoJson);
    if (await this.isNewPairingRequest(pairInfo)) {
      this.messageService.addBeaconWait(`Pairing with ${pairInfo.name}. Please wait!`);
    }
  }
  async isNewPairingRequest(pairInfo: P2PPairingRequest): Promise<boolean> {
    if (!pairInfo?.publicKey) {
      return true;
    }
    const exists = await this.ensureClient().hasPeer(pairInfo.publicKey);
    if (exists) {
      console.log('Existing public key found!');
    }
    return !exists;
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
    await this.client.removeAllPeers();
    await this.syncBeaconState();
  }
  async removePeer(index: number) {
    const pairInfo = this.peers[index];
    if (!pairInfo) {
      return;
    }
    await this.client.removePeer(pairInfo);
    await this.syncBeaconState();
  }
  async removePermissions() {
    await this.client.removeAllPermissions();
    await this.syncBeaconState();
  }
  async removePermission(index: number) {
    await this.client.removePermission(this.permissions[index].accountIdentifier, this.permissions[index].senderId);
    await this.syncBeaconState();
  }
  async getPeers(): Promise<ExtendedPeerInfo[]> {
    return await this.client.getPeers();
  }
  async getPermissions(): Promise<PermissionInfo[]> {
    return await this.client.getPermissions();
  }
  async getAppMetadataList(): Promise<AppMetadata[]> {
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
  async respondWithError(errorType: BeaconErrorType, requestMessage: { id: string } | string) {
    if (requestMessage) {
      await this.client.respondError(requestMessage, errorType);
    }
  }

  async approvePermissionRequest(message: PermissionRequestOutput, publicKey: string) {
    await this.client.respondPermission(message, { publicKey });
  }
  async approveOperationRequest(message: OperationRequestOutput, transactionHash: string) {
    await this.client.respondOperation(message, transactionHash);
  }
  async approveSignPayloadRequest(message: SignPayloadRequestOutput, signature: string) {
    await this.client.respondSignPayload(message, signature);
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
    const sn = await this.client?.getSelectedMatrixNode();
    console.log(sn, '=>', relay);
    const eventUrl = `https://services.kukai.app/v1/events/?eventId=pair-time-v2&id=${senderId}-${t0}&timeout=${timeout}&url=${encodeURIComponent(
      url
    )}&walletRelay=${encodeURIComponent(sn)}&dappRelay=${encodeURIComponent(relay)}&rtt=${rtt}`;
    if (environment?.production) {
      fetch(eventUrl);
    }
  }
}
