import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { BroadcastChannel } from 'broadcast-channel';
export enum MessageKind {
  Initialized = 'wc_initialized',
  ShareWeight = 'wc_share_weight'
}
export type Message =
  | {
      kind: MessageKind.Initialized;
      payload: number;
    }
  | {
      kind: MessageKind.ShareWeight;
      payload: number;
    };
@Injectable({
  providedIn: 'root'
})
export class BcService {
  channel: BroadcastChannel<Message>;
  subject: any = {
    wc_initialized: new Subject<any>(),
    wc_share_weight: new Subject<any>(),
    test: new Subject<any>(),
    all: new Subject<Message>()
  };
  constructor() {
    this.channel = new BroadcastChannel('tab-sync');
    this.channel.onmessage = (msg) => this.handleMessage(msg);
  }
  private handleMessage(msg: Message) {
    console.log('bc-message', msg);
    if (!this.subject[msg.kind]) {
      throw new Error('Invalid MessageKind: ' + msg?.kind);
    }
    this.subject[msg?.kind].next(msg.payload);
    this.subject.all.next(msg);
  }
  public broadcast(message: Message) {
    console.log('broadcast', message);
    this.channel.postMessage(message);
  }
}
