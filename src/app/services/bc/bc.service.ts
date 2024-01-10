import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { BroadcastChannel, createLeaderElection, LeaderElector } from 'broadcast-channel';
export enum MessageKind {
  PropagateRequest = 'wc_propagate_request',
  PropagateResponse = 'wc_propagate_response',
  DeleteRequest = 'wc_delete_request',
  PairingRequest = 'wc_pairing_request',
  UpdateRequest = 'wc_session_update',
  RefreshDappList = 'wc_refresh_dapp_list'
}
export type Message =
  | {
      kind: MessageKind.PairingRequest;
      payload: string;
    }
  | {
      kind: MessageKind.DeleteRequest;
      payload: string;
    }
  | {
      kind: MessageKind.PropagateRequest;
      payload: any;
    }
  | {
      kind: MessageKind.PropagateResponse;
      payload: any;
    }
  | {
      kind: MessageKind.UpdateRequest;
      payload: any;
    }
  | {
      kind: MessageKind.RefreshDappList;
      payload: undefined;
    };
@Injectable({
  providedIn: 'root'
})
export class BcService {
  private _initAsLeader;
  private channel: BroadcastChannel<Message>;
  private elector: LeaderElector;
  private _elected: any;
  public elected: Promise<void> = new Promise((resolve) => {
    this._elected = resolve;
  });
  private _initDone: any;
  private initDone: Promise<void> = new Promise((resolve) => {
    this._initDone = resolve;
  });
  subject: any = {
    wc_pairing_request: new Subject<any>(),
    wc_delete_request: new Subject<any>(),
    wc_propagate_request: new Subject<any>(),
    wc_propagate_response: new Subject<any>(),
    wc_session_update: new Subject<any>(),
    wc_refresh_dapp_list: new Subject<any>(),
    test: new Subject<any>(),
    all: new Subject<Message>()
  };
  constructor() {
    this.channel = new BroadcastChannel('tab-sync');
    this.channel.onmessage = (msg) => this.handleMessage(msg);
    this.waitOnLeadership().then(() => this._elected());
  }
  private async waitOnLeadership(): Promise<void> {
    this.elector = createLeaderElection(this.channel);
    this.elector.onduplicate = () => {
      console.warn('duplicate leaders!');
    };
    this.elector.hasLeader().then((hasLeader) => {
      console.log(`%c# ${hasLeader ? 'WC2 leader already exist' : 'No WC2 leader found'} #`, 'color: darkblue');
      this._initAsLeader = !hasLeader;
      this._initDone();
    });
    await this.elector.awaitLeadership();
    console.log('%c# This tab is now elected wc2 leader #', 'color: darkgreen');
  }
  public async initAsLeader(): Promise<boolean> {
    !this.initDone || (await this.initDone);
    if (this._initAsLeader !== undefined) {
      return this._initAsLeader;
    }
    const hasLeader = await this.elector.hasLeader();
    return (this._initAsLeader = !hasLeader);
  }
  private handleMessage(msg: Message) {
    console.log('bc-message received', msg);
    if (!this.subject[msg.kind]) {
      throw new Error('Invalid MessageKind: ' + msg?.kind);
    }
    this.subject[msg?.kind].next(msg.payload);
    this.subject.all.next(msg);
  }
  public broadcast(message: Message) {
    console.log('bc-message broadcasted', message);
    this.channel.postMessage(message);
  }
}
