import { Injectable } from '@angular/core';

@Injectable()
export class MessageService {
  messages: any[] = [];
  defaultTime = 10;
  add(message: string, seconds = this.defaultTime) {
    const type = 'info';
    console.log(type + ': ' + message);
    this.messages.push({
      type: type,
      msg: message,
      timeout: seconds * 1000
    });
  }
  addError(message: string, seconds = this.defaultTime) {
    const type = 'danger';
    console.log(type + ': ' + message);
    this.messages.push({
      type: type,
      msg: message,
      timeout: seconds * 1000
    });
  }
  addWarning(message: string, seconds = this.defaultTime) {
    const type = 'warning';
    console.log(type + ': ' + message);
    this.messages.push({
      type: type,
      msg: message,
      timeout: seconds * 1000
    });
  }
  addSuccess(message: string, seconds = this.defaultTime) {
    const type = 'success';
    console.log(type + ': ' + message);
    this.messages.push({
      type: type,
      msg: message,
      timeout: seconds * 1000
    });
  }
  clear() {
    this.messages = [];
  }
}
