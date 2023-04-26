import { Injectable } from '@angular/core';
import Client, { ENGINE_RPC_OPTS, SignClient } from '@walletconnect/sign-client';
import { SignClientTypes, PairingTypes, SessionTypes, ISession } from '@walletconnect/types';
// https://github.com/WalletConnect/walletconnect-monorepo/blob/bc6f6632b7c665d868bcd59669281c1ead2dd31a/packages/utils/src/errors.ts#L10
import { ErrorResponse, formatJsonRpcResult, formatJsonRpcRequest, formatJsonRpcError, getErrorByCode, getError } from '@walletconnect/jsonrpc-utils';
import { getSdkError } from '@walletconnect/utils';
import { CONSTANTS, environment } from '../../../environments/environment';
import { SubjectService } from '../subject/subject.service';
import { OperationService } from '../operation/operation.service';
import { BcService, MessageKind } from '../bc/bc.service';
import { WalletService } from '../wallet/wallet.service';
import { Subscription } from 'rxjs';

interface Pairings {
  expanded: boolean;
  size: number;
  dapp: Record<string, DPairings>;
}
interface DPairings {
  expanded: boolean;
  p: DPairing[];
}
interface DPairing {
  name: string;
  topic: string;
  expiry: number;
}
interface Sessions {
  expanded: boolean;
  size: number;
  dapp: Record<string, DSessions>;
}
interface DSessions {
  expanded: boolean;
  s: DSession[];
}
interface DSession {
  name: string;
  address: string;
  topic: string;
  expiry: number;
}
@Injectable({
  providedIn: 'root'
})
export class WalletConnectService {
  readonly supportedMethods = ['tezos_send', 'tezos_sign', 'tezos_getAccounts'];
  readonly supportedEvents = [];
  weight = Date.now();
  weights = [];
  wc2activated = false;
  client: Client;
  active = false;
  private subscriptions: Subscription;
  delayedPairing: any;
  sessions: Sessions = { expanded: false, size: 0, dapp: {} };
  pairings: Pairings = { expanded: false, size: 0, dapp: {} };
  display: {
    pairing: Record<string, { offset: number; expanded: boolean }>;
    session: Record<string, { offset: number; expanded: boolean }>;
    pairingsExpanded: boolean;
    sessionsExpanded: boolean;
  } = { pairing: {}, session: {}, pairingsExpanded: false, sessionsExpanded: false };
  constructor(
    private subjectService: SubjectService,
    private operationService: OperationService,
    private bcService: BcService,
    private walletService: WalletService
  ) {
    (async () => {
      this.wc2activated = !!localStorage.getItem('wc2-activated');
      if (this.wc2activated) {
        await this.startClient();
      }
    })();
    const self = this;
    window.addEventListener('beforeunload', function (e) {
      if (self.wc2activated) {
        self.bcService.broadcast({ kind: MessageKind.Initialized, payload: self.active ? 0 : 2 });
      }
    });
  }
  async startClient() {
    this.weight = Date.now();
    this.client = await this.createClient();
    this.active = true;
    this.bcService.broadcast({ kind: MessageKind.Initialized, payload: 1 });
    this.subscriptions?.unsubscribe();
    this.subscriptions = new Subscription();
    this.subscribeToEvents();
    if (this.delayedPairing) {
      await this.delayedPairing();
    }
    this.refresh();
  }
  async createClient() {
    const opts: SignClientTypes.Options = {
      projectId: '97f804b46f0db632c52af0556586a5f3',
      relayUrl: 'wss://relay.walletconnect.com',
      logger: 'warn', //'debug',
      metadata: {
        name: 'Kukai Wallet',
        description: 'Manage your digital assets and seamlessly connect with experiences and apps on Tezos.',
        url: 'https://wallet.kukai.app',
        icons: []
      }
    };
    return Client.init(opts);
  }
  subscribeToEvents() {
    this.client.on('session_proposal', (data) => this.proposalHandler(data));
    this.subscriptions.add(
      this.bcService.subject[MessageKind.Initialized].subscribe((payload) => {
        switch (payload) {
          case 0: // Tab with active wc2 connection closed => restart transport for client with highest weight
            this.bcService.broadcast({ kind: MessageKind.ShareWeight, payload: this.weight });
            setTimeout(() => {
              if (this.weights.every((weight: number) => weight < this.weight)) {
                this.restartClient();
              }
              this.weights = [];
            }, 200);
            break;
          case 1: // Another tab flag itself as active => make sure this tab is flagged as inactive
            this.active = false;
            this.stopClient();
            break;
          case 2: // Tab with inactive wc2 connection closed => restart transport as hotfix for bug that can occur with 3 or more Kukai tabs open
            if (this.active) this.restartClient();
            break;
        }
      })
    );
    this.subscriptions.add(
      this.bcService.subject[MessageKind.ShareWeight].subscribe((payload) => {
        this.weights.push(payload);
      })
    );
    this.subscriptions.add(
      this.bcService.subject[MessageKind.PropagateRequest].subscribe((request) => {
        console.log('propagated request:', request.type, request);
        this.subjectService.wc2.next(request);
      })
    );
    this.subscriptions.add(
      this.bcService.subject[MessageKind.PropagateResponse].subscribe((response) => {
        if (this.active) {
          console.log('propagated response:', response);
          if (response.pairingApproved !== undefined) {
            if (response.pairingApproved) {
              this.approvePairing(response.request, response.publicKey);
            } else {
              this.rejectPairing(response.request);
            }
          } else {
            this.opResponse(response.request, response.hash, response.success);
          }
        }
      })
    );
    this.client.on('session_request', (data) => this.requestHandler(data));
    this.client.on('session_delete', (data) => {
      console.log('delete', data);
      this.refresh();
    });
    this.client.on('session_expire', (data) => {
      console.log('expire', data);
      this.refresh();
    });
    this.client.core.pairing.events.on('pairing_delete', (data) => {
      console.log('delete', data);
      this.refresh();
    });
    this.client.core.pairing.events.on('pairing_expire', (data) => {
      console.log('expire', data);
      this.refresh();
    });
    // this.client.core.heartbeat.events.on('heartbeat_pulse', (data) => {
    //   console.log('heartbeat', data);
    // })
    const unhandledSignClientEvents: SignClientTypes.Event[] = [
      'session_update',
      'session_extend',
      'session_ping',
      //'session_delete',
      //'session_expire',
      //'pairing_delete',
      //'session_request',
      'session_event',
      'proposal_expire'
    ];
    const unhandledPairingEvents: string[] = ['pairing_ping'];
    for (const event of unhandledSignClientEvents) {
      this.client.on(event, (data: any) => console.log(event, data));
    }
    for (const event of unhandledPairingEvents) {
      this.client.core.pairing.events.on(event, (data: any) => console.log(event, data));
    }
    /*
    session_extend: "session_extend",
    pairing_ping: "pairing_ping",
    session_expire: "session_expire",
    pairing_delete: "pairing_delete",
    pairing_expire: "pairing_expire",
    proposal_expire: "proposal_expire",
    */
  }
  async proposalHandler(data) {
    const message: any = {
      id: data.id,
      version: 0,
      type: 'permission_request',
      appMetadata: {
        name: data?.params?.proposer?.metadata?.name,
        icon: data?.params?.proposer?.metadata?.icons[0]
      },
      wcData: data
    };
    if (data.params.requiredNamespaces.tezos.chains.includes(`tezos:${CONSTANTS.NETWORK}`)) {
      message.network = { type: CONSTANTS.NETWORK };
    } else {
      console.log(data.params.requiredNamespaces.tezos.chains);
      throw new Error('wrong network');
    }
    message.scopes = { methods: data.params.requiredNamespaces.tezos.methods, events: data.params.requiredNamespaces.tezos.events };
    this.subjectService.wc2.next(message);
    this.bcService.broadcast({ kind: MessageKind.PropagateRequest, payload: message });
    console.log('proposal', data);
  }
  async approvePairing(request: any, publicKey: string) {
    if (this.active) {
      const data = request.wcData;
      const namespaces: SessionTypes.Namespaces = {};
      const address = this.operationService.pk2pkh(publicKey);
      const accounts: string[] = [`tezos:${CONSTANTS.NETWORK}:${address}`];
      const methods = data.params.requiredNamespaces?.tezos?.methods
        ?.filter((method) => this.supportedMethods.includes(method))
        .concat(data.params.optionalNamespaces?.tezos?.methods?.filter((method) => this.supportedMethods.includes(method)))
        .filter((m) => m);
      const events = data.params.requiredNamespaces?.tezos?.events
        ?.filter((event) => this.supportedEvents.includes(event))
        .concat(data.params.optionalNamespaces?.tezos?.events?.filter((event) => this.supportedEvents.includes(event)))
        .filter((e) => e);
      namespaces.tezos = {
        accounts,
        methods,
        events
      };
      const { topic, acknowledged } = await this.client.approve({
        id: data.id,
        relayProtocol: data.params.relays[0].protocol,
        namespaces
      });
      this.refresh();
      await acknowledged();
      //this.bcService.broadcast({ kind: MessageKind.PropagateResponse, payload: null })
      this.refresh();
    } else {
      this.bcService.broadcast({ kind: MessageKind.PropagateResponse, payload: { request, publicKey, pairingApproved: true } });
    }
  }
  async opResponse(request: any, hash: string, success: boolean) {
    if (hash === 'silent') {
      return;
    }
    console.log('opResponse', hash);
    if (this.active) {
      const data = request.wcData;
      const result = formatJsonRpcResult(data.id, hash);
      const error = formatJsonRpcError(data.id, getSdkError('USER_REJECTED').message);
      await this.client.respond({
        topic: data.topic,
        response: success ? result : error
      });
    } else {
      // if not silent
      this.bcService.broadcast({ kind: MessageKind.PropagateResponse, payload: { request, hash, success } });
    }
  }
  async rejectPairing(request: any) {
    const data = request.wcData;
    if (this.active) {
      await this.client.reject({
        id: data.id,
        reason: getSdkError('USER_REJECTED')
      });
    } else {
      this.bcService.broadcast({ kind: MessageKind.PropagateResponse, payload: { request, pairingApproved: false } });
    }
  }
  private async requestHandler(data: any) {
    console.log('requestHandler', data);
    const session = this.client.session.get(data.topic);
    const allowedAccounts = session?.namespaces?.tezos?.accounts || [];
    const allowedMethods = session.namespaces.tezos.methods || [];
    const account = `${data.params.chainId}:${data.params.request.params.account}`;
    const method = data.params.request.method;
    if (!allowedMethods.includes(method)) {
      throw new Error(`Method not allowed: ${method}`);
    }
    if (!allowedAccounts.includes(account) && !['tezos_getAccounts'].includes(method)) {
      throw new Error(`Account not allowed: ${account}`);
    }
    switch (method) {
      case 'tezos_send':
        const send_req = {
          type: 'operation_request',
          version: 0,
          sourceAddress: data.params.request.params.account,
          operationDetails: data.params.request.params.operations,
          network: { type: data.params.chainId.split(':')[1] },
          wcData: data
        };
        this.subjectService.wc2.next(send_req);
        this.bcService.broadcast({ kind: MessageKind.PropagateRequest, payload: send_req });
        break;
      case 'tezos_sign':
        const sign_req = {
          type: 'sign_payload_request',
          version: 0,
          sourceAddress: data.params.request.params.account,
          signingType: 'raw',
          payload: data.params.request.params.payload,
          wcData: data
        };
        this.subjectService.wc2.next(sign_req);
        this.bcService.broadcast({ kind: MessageKind.PropagateRequest, payload: sign_req });
        break;
      case 'tezos_getAccounts':
        try {
          const session = this.client.session.get(data.topic);
          const accounts: { algo: string; address: string; pubkey: string }[] = session.namespaces.tezos.accounts.map((account) => {
            const address: string = account.split(':')[2];
            const impAcc = this.walletService.wallet.getImplicitAccount(address);
            if (!impAcc) {
              throw new Error('User is not logged in with the requested account');
            }
            const algo: string = address.startsWith('tz1') ? 'ed25519' : address.startsWith('tz2') ? 'secp256k1' : 'unknown';
            const pubkey = impAcc.pk;
            return { algo, address, pubkey };
          });
          await this.client.respond({
            topic: data.topic,
            response: formatJsonRpcResult(data.id, accounts)
          });
        } catch (e) {
          console.error(e.message);
          const error = formatJsonRpcError(data.id, getSdkError('USER_REJECTED').message);
          await this.client.respond({
            topic: data.topic,
            response: error
          });
        }
        break;
      default:
        console.warn('Unhandled request');
    }
    this.client.extend({ topic: data.topic });
    this.refresh();
  }
  async pair(pairingString: string) {
    if (!this.client) {
      if (!this.wc2activated) {
        localStorage.setItem('wc2-activated', JSON.stringify(true));
        this.wc2activated = true;
        console.log('Wallet Connect 2 activated');
        this.startClient();
      }
      await new Promise((resolve, reject) => {
        this.delayedPairing = resolve;
      });
    }
    const paired = await this.client.pair({ uri: pairingString });
    console.log('paired', paired);
  }
  refresh(n = 0) {
    const sessionsList: DSession[] = this.client.session
      .getAll()
      .map((session) => {
        if (session?.acknowledged && this.client.core.crypto.keychain.has(session?.topic)) {
          const accountAddress = session?.namespaces?.tezos?.accounts[0].split(':')[2];
          return { name: session?.peer?.metadata?.name, address: accountAddress, topic: session.topic, expiry: session.expiry };
        }
      })
      .filter((s) => s);
    const _sessions: Sessions = { expanded: this.sessions.expanded, size: sessionsList.length, dapp: {} };
    for (const dSession of sessionsList) {
      if (_sessions.dapp[dSession['name']]) {
        _sessions.dapp[dSession['name']].s.push(dSession);
      } else {
        const expanded = this.sessions.dapp[dSession['name']]?.expanded ?? false;
        _sessions.dapp[dSession['name']] = { expanded, s: [dSession] };
      }
    }
    this.sessions = _sessions;
    const pairingsList: DPairing[] = this.client.core.pairing
      .getPairings()
      .map((pairing) => {
        if (pairing.active && this.client.core.crypto.keychain.has(pairing?.topic)) {
          return { name: pairing?.peerMetadata?.name, topic: pairing.topic, expiry: pairing.expiry };
        }
      })
      .filter((p) => p);
    const _pairings: Pairings = { expanded: this.pairings.expanded, size: pairingsList.length, dapp: {} };
    for (const dPairing of pairingsList) {
      if (_pairings.dapp[dPairing['name']]) {
        _pairings.dapp[dPairing['name']].p.push(dPairing);
      } else {
        const expanded = this.pairings.dapp[dPairing['name']]?.expanded ?? false;
        _pairings.dapp[dPairing['name']] = { expanded, p: [dPairing] };
      }
    }
    this.pairings = _pairings;
    console.log('pairings/sessions', structuredClone({ pairings: this.pairings, sessions: this.sessions }));
    if (++n < 3) {
      setTimeout(() => {
        this.refresh(n);
      }, n ** 2 * 100);
    }
  }
  public async updateSession(topic: string, newAddress: string) {
    const session = this.client.session.get(topic);
    let namespaces = session.namespaces;
    let acc = namespaces.tezos.accounts[0].split(':');
    acc[2] = newAddress;
    namespaces.tezos.accounts[0] = acc.join(':');
    const { acknowledged } = await this.client.update({ topic, namespaces });
    this.refresh();
    await acknowledged();
    console.log('session update acknowledged');
  }
  public async deleteSession(topic: string) {
    await this.delete(topic);
  }
  public async deletePairing(topic: string) {
    await this.delete(topic);
  }
  public async delete(topic: string) {
    try {
      await this.disconnect(topic);
    } catch (e) {
      console.error(e);
      this.refresh();
    }
  }
  public async deletePairings(pairings) {
    for (const pairing of pairings) {
      try {
        await this.deletePairing(pairing.topic);
      } catch (e) {
        console.error(e);
      }
    }
    this.refresh();
  }
  public async deleteSessions(sessions) {
    for (const session of sessions) {
      try {
        await this.deleteSession(session.topic);
      } catch (e) {
        console.error(e);
      }
    }
    this.refresh();
  }
  private async disconnect(topic: string) {
    console.log('delete', topic);
    try {
      await this.client.disconnect({
        topic,
        reason: getSdkError('USER_DISCONNECTED')
      });
    } catch (e) {
      console.error(e);
      console.log(this.pairings, this.sessions);
    }
    this.refresh();
  }
  async restartClient() {
    console.time('restart');
    await this.stopClient();
    await this.startClient();
    console.timeEnd('restart');
  }
  private async stopClient() {
    //https://github.com/WalletConnect/walletconnect-monorepo/blob/v2.0/packages/sign-client/test/shared/helpers.ts#L4
    this.client?.core?.heartbeat?.stop();
    await this.removeListeners();
  }
  private async removeListeners(path = []) {
    const isObject = (val) => val && typeof val === 'object' && !Array.isArray(val);
    let obj: any = this.client;
    path.forEach((prop) => {
      obj = obj[prop];
    });
    if (isObject(obj)) {
      if (obj?.events?.eventNames()?.length) {
        for (const key of obj.events.eventNames()) {
          await obj.events.removeAllListeners(key as any);
        }
      }
      Object.keys(obj).forEach((key: string) => {
        if (!path.includes(key)) {
          this.removeListeners([...path, key]);
        }
      });
    }
  }
}
