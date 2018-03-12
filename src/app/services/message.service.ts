import { Injectable } from '@angular/core';

@Injectable()
export class MessageService {
  messages: any[] = [];

  add(message: string) {
    this.messages.push({
      type: 'info',
      msg: message,
      timeout: 10000
    });
  }
  addError(message: string) {
    this.messages.push({
      type: 'danger',
      msg: message,
      timeout: 10000
    });
  }
  addWarning(message: string) {
    this.messages.push({
      type: 'warning',
      msg: message,
      timeout: 10000
    });
  }
  addSuccess(message: string) {
    this.messages.push({
      type: 'success',
      msg: message,
      timeout: 10000
    });
  }
  clear() {
    this.messages = [];
  }
}
