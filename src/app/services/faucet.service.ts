import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import * as lib from '../../assets/js/main.js';

@Injectable()
export class FaucetService {
  canGetFree = true;
  constructor(private messageService: MessageService) { }

  freeTezzies(pkh: string) {
    if (this.canGetFree) {
      this.setTimer(2);
      this.messageService.add('Requesting free tezzies');
      const promise = lib.eztz.alphanet.faucet(pkh);
      if (promise) {
        return promise.then(
          (val) => { this.messageService.addSuccess('Here you got 100 000ꜩ!'); return true; },
          (err) => { this.messageService.addError('Error from faucet: ' + JSON.stringify(err)); return false; }
        );
      }
    } else {
      this.messageService.add('Slow down a bit...');
    }
  }
  setTimer(s: number) {
    this.canGetFree = false;
    setTimeout(() => {
      this.canGetFree = true;
    }, s * 1000);
  }
}
