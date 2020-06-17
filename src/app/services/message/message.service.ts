import { Injectable } from '@angular/core';

@Injectable()
export class MessageService {
  spinnerOn = false;
  spinnerText = '';
  messages: any[] = [];
  defaultTime = 10;
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
  addSuccess(message: string, seconds: number = this.defaultTime) {
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
  async startSpinner(text: string = '') {
    this.spinnerText = text;
    this.spinnerOn = true;
  }
  async stopSpinner() {
    this.spinnerText = '';
    this.spinnerOn = false;
  }
}
