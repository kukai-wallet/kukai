import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';

@Injectable()
export class MessageService {
  spinnerOn = false;
  spinnerText = '';
  messages: any[] = [];
  defaultTime = 10;
  checked: Observable<boolean>;
  beaconResponse = new Subject<boolean>();
  readonly pairingCompleteMsg = 'Pairing complete! Waiting for permission request...';
  add(message: string, seconds: number = this.defaultTime) {
    const type = 'info';
    console.log(type + ': ' + message);
    this.messages.push({
      type: type,
      msg: message,
      timeout: seconds * 1000
    });
  }
  addError(message: string, seconds: number = this.defaultTime) {
    const type = 'danger';
    console.log(type + ': ' + message);
    this.messages.push({
      type: type,
      msg: message,
      timeout: seconds * 1000
    });
  }
  addWarning(message: string, seconds: number = this.defaultTime) {
    const type = 'warning';
    console.log(type + ': ' + message);
    this.messages.push({
      type: type,
      msg: message,
      timeout: seconds * 1000
    });
  }
  addSuccess(message: string, seconds: number = this.defaultTime, ref: string = '') {
    if (ref) {
      console.log('ref set', ref);
    }
    const type = 'success';
    console.log(type + ': ' + message);
    this.messages.push({
      type: type,
      msg: message,
      timeout: seconds * 1000,
      ref
    });
  }
  modify(newMessage: string, ref: string) {
    if (ref) {
      for (const message of this.messages) {
        if (message.ref === ref) {
          message.msg = newMessage;
        }
      }
    }
  }
  emailNotify(email: string, amount: string) {
    console.log(email);
    const type = 'success';
    this.messages.push({
      type: type,
      timeout: 0,
      msg: 'email',
      email,
      amount
    });
  }
  redditNotify(username: string, amount: string) {
    console.log(username);
    const type = 'success';
    this.messages.push({
      type: type,
      timeout: 0,
      msg: 'Reddit',
      username,
      amount
    });
  }
  twitterNotify(twitterId: string, handler: string, amount: string) {
    console.log(twitterId);
    const type = 'success';
    this.messages.push({
      type: type,
      timeout: 0,
      msg: 'Twitter',
      twitterId,
      handler,
      amount
    });
  }
  addBeaconWait(message: string) {
    const type = 'info';
    this.messages.push({
      type: type,
      msg: message,
      timeout: 30 * 1000,
      loader: true
    });
  }
  async removeBeaconMsg(delay = false) {
    setTimeout(
      () => {
        for (let i = 0; i < this.messages.length; i++) {
          if (this.messages[i].loader) {
            this.messages.splice(i, 1);
            this.addSuccess(this.pairingCompleteMsg, 10);
            break;
          } else if (this.messages[i].msg === this.pairingCompleteMsg) {
            this.messages.splice(i, 1);
            break;
          }
        }
      },
      delay ? 500 : 0
    );
  }
  clear() {
    this.messages = [];
  }
  async startSpinner(text: string = '') {
    this.spinnerText = text;
    this.spinnerOn = true;
  }
  async stopSpinner(): Promise<void> {
    this.spinnerText = '';
    this.spinnerOn = false;
    return;
  }
}
