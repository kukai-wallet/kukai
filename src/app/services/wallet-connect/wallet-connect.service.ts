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
  readonly supportedMethods = ['tezos_send', 'tezos_sign'];
  readonly supportedEvents = [];
  wc2activated = false;
  client: Client;
  active = false;
  delayedPairing: any;
  sessions: Sessions = { expanded: false, size: 0, dapp: {} };
  pairings: Pairings = { expanded: false, size: 0, dapp: {} };
  display: {
    pairing: Record<string, { offset: number; expanded: boolean }>;
    session: Record<string, { offset: number; expanded: boolean }>;
    pairingsExpanded: boolean;
    sessionsExpanded: boolean;
  } = { pairing: {}, session: {}, pairingsExpanded: false, sessionsExpanded: false };
  constructor(private subjectService: SubjectService, private operationService: OperationService, private bcService: BcService) {
    (async () => {
      this.wc2activated = !!localStorage.getItem('wc2-activated');
      if (this.wc2activated) {
        await this.init();
      }
    })();
    const self = this;
    window.addEventListener('beforeunload', function (e) {
      if (self.wc2activated) {
        self.bcService.broadcast({ kind: MessageKind.Initialized, payload: self.active ? 0 : 2 });
      }
    });
  }
  async init() {
    this.client = await this.createClient();
    this.active = true;
    this.bcService.broadcast({ kind: MessageKind.Initialized, payload: 1 });
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
    this.bcService.subject[MessageKind.Initialized].subscribe((payload) => {
      switch (payload) {
        case 0: // Tab with active wc2 connection closed => restart transport in all tabs to get a new active wc2 connection
          this.restart();
          break;
        case 1: // Another tab flag itself as active => make sure this tab is flagged as inactive
          this.active = false;
          break;
        case 2: // Tab with inactive wc2 connection closed => restart transport as hotfix for bug that can occur with 3 or more Kukai tabs open
          if (this.active) this.restart();
          break;
      }
    });
    this.client.on('session_request', (data) => this.requestHandler(data));
    this.client.on('session_delete', (data) => {
      console.log('delete', data);
      this.refresh();
      setTimeout(() => {
        this.refresh();
      }, 100);
    });
    this.client.on('session_expire', (data) => {
      console.log('expire', data);
      this.refresh();
      setTimeout(() => {
        this.refresh();
      }, 100);
    });
    this.client.core.pairing.events.on('pairing_delete', (data) => {
      console.log('delete', data);
      this.refresh();
      setTimeout(() => {
        this.refresh();
      }, 100);
    });
    this.client.core.pairing.events.on('pairing_expire', (data) => {
      console.log('expire', data);
      this.refresh();
      setTimeout(() => {
        this.refresh();
      }, 100);
    });
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
    console.log('proposal', data);
  }
  async approvePairing(request: any, publicKey: string) {
    const data = request.wcData;
    console.log('data', data);
    const namespaces: SessionTypes.Namespaces = {};
    Object.keys(data.params.requiredNamespaces).forEach((key) => {
      const address = this.operationService.pk2pkh(publicKey);
      const accounts: string[] = [`tezos:${CONSTANTS.NETWORK}:${address}`];
      namespaces[key] = {
        accounts,
        methods: data.params.requiredNamespaces[key].methods.filter((method) => this.supportedMethods.includes(method)),
        events: data.params.requiredNamespaces[key].events.filter((event) => this.supportedEvents.includes(event))
      };
    });
    const { topic, acknowledged } = await this.client.approve({
      id: data.id,
      relayProtocol: data.params.relays[0].protocol,
      namespaces
    });
    this.refresh();
    await acknowledged();
    this.refresh();
  }
  async opResponse(request: any, hash: string, success: boolean) {
    const data = request.wcData;
    const result = formatJsonRpcResult(data.id, hash);
    const error = formatJsonRpcError(data.id, getSdkError('USER_REJECTED').message);
    await this.client.respond({
      topic: data.topic,
      response: success ? result : error
    });
  }
  async rejectPairing(request: any) {
    const data = request.wcData;
    await this.client.reject({
      id: data.id,
      reason: getSdkError('USER_REJECTED')
    });
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
    if (!allowedAccounts.includes(account)) {
      throw new Error(`Account not allowed: ${account}`);
    }
    if (data?.params?.request?.method === 'tezos_send') {
      const message: any = {
        type: 'operation_request',
        version: 0,
        sourceAddress: data.params.request.params.account,
        operationDetails: data.params.request.params.operations,
        network: { type: data.params.chainId.split(':')[1] },
        wcData: data
      };
      this.subjectService.wc2.next(message);
    } else if (data?.params?.request?.method === 'tezos_sign') {
      const message: any = {
        type: 'sign_payload_request',
        version: 0,
        sourceAddress: data.params.request.params.account,
        signingType: 'raw',
        payload: data.params.request.params.payload,
        wcData: data
      };
      this.subjectService.wc2.next(message);
    } else {
      console.warn('Unhandled request');
      return;
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
        this.init();
      }
      await new Promise((resolve, reject) => {
        this.delayedPairing = resolve;
      });
    }
    const paired = await this.client.pair({ uri: pairingString });
    console.log('paired', paired);
  }
  refresh() {
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
    console.log('pairings/sessions', { pairings: this.pairings, sessions: this.sessions });
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
  async restart() {
    console.time('restart');
    await this.init();
    //await this.client.core.relayer.restartTransport();
    this.active = true;
    console.timeEnd('restart');
  }
}
