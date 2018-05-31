import { Injectable } from '@angular/core';

@Injectable()
export class MessageService {
  messages: any[] = [];

  add(message: string) {
    const type = 'info';
    console.log(type + ': ' + message);
    this.messages.push({
      type: type,
      msg: message,
      timeout: 15000
    });
  }
  addError(message: string) {
    const type = 'danger';
    console.log(type + ': ' + message);
    this.messages.push({
      type: type,
      msg: message,
      timeout: 15000
    });
  }
  addWarning(message: string) {
    const type = 'warning';
    console.log(type + ': ' + message);
    this.messages.push({
      type: type,
      msg: message,
      timeout: 15000
    });
  }
  addSuccess(message: string) {
    const type = 'success';
    console.log(type + ': ' + message);
    this.messages.push({
      type: type,
      msg: message,
      timeout: 15000
    });
  }
  clear() {
    this.messages = [];
  }
}
