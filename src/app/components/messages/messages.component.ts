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
  readonly subject = 'Sent you Tezos tokens';
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
    } else if (message.twitterId) {
      return this.twitterPmFormat(message);
    } else {
      throw new Error('Invalid message');
    }
  }
  mailtoFormat(message: any): string {
    const subject = encodeURI(this.subject);
    const body = this.encodedBody(message.amount, 'Google', `${this.getHostName()}\n\n`);
    return `mailto:${message.email}?subject=${subject}&body=${body}`;
  }
  redditPmFormat(message: any) {
    // https://www.reddit.com/message/compose?to=USERNAME&subject=SUBJECT&message=MESSAGE
    const subject = encodeURI(this.subject);
    const body = this.encodedBody(message.amount, 'Reddit', `[kukai.app](https://${this.getHostName()}/direct-auth)`);
    return `https://www.reddit.com/message/compose?to=${message.username}&subject=${subject}&message=${body}`;
  }
  twitterPmFormat(message: any) {
    // https://twitter.com/messages/compose?recipient_id=USER_ID&text=MESSAGE
    const body = this.encodedBody(message.amount, 'Twitter', `https://${this.getHostName()}/direct-auth`);
    return `https://twitter.com/messages/compose?recipient_id=${message.twitterId}&text=${body}`;
  }
  encodedBody(amount: string, accountType: string, url: string): string {
    return encodeURI(`Hi,\nI sent you ${amount} tez using the Kukai wallet. You can access your wallet with your ${accountType} account at: ${url}`);
  }
}
