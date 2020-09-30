import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MessageService } from '../../services/message/message.service';
import { TorusService } from '../../services/torus/torus.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  constructor(
    public messageService: MessageService,
    private location: Location,
    public torusService: TorusService
    ) { }

  ngOnInit() {
  }
  removeMessage(index: number) {
    this.messageService.messages.splice(index, 1);
  }
  getHostName() {
    return location.hostname;
  }
  notifyFormat(message: any) {
    if (message.email) {
      return this.mailtoFormat(message);
    } else if (message.username) {
      return this.redditPmFormat(message);
    } else {
      throw new Error('Invalid message');
    }
  }
  mailtoFormat(message: any): string {
    const subject = encodeURI('Tezos Transaction');
    const body = encodeURI(`Hi,\nI just sent you ${message.amount} tez. You can access your Tezos wallet with your Google account at: ${this.getHostName()}\n\n`);
    return `mailto:${message.email}?subject=${subject}&body=${body}`;
  }
  redditPmFormat(message: any) {
    // https://www.reddit.com/message/compose?to=USERNAME&subject=SUBJECT&message=MESSAGE
    const subject = encodeURI('Tezos Transaction');
    const body = encodeURI(`Hi,\nI just sent you ${message.amount} tez. You can access your Tezos wallet with your Reddit account at: [kukai.app](https://${this.getHostName()}/direct-auth)`);
    return `https://www.reddit.com/message/compose?to=${message.username}&subject=${subject}&message=${body}`;
  }
}
