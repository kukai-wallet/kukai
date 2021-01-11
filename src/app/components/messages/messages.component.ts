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
    const body = this.encodedBody(message.amount, 'Google', `https://${this.getHostName()}/direct-auth\n\n`);
    return `mailto:${message.email}?subject=${subject}&body=${body}`;
  }
  redditPmFormat(message: any) {
    // https://www.reddit.com/message/compose?to=USERNAME&subject=SUBJECT&message=MESSAGE
    const subject = encodeURI(this.subject);
    const body = this.encodedBody(`${message.amount}`, 'Reddit', `[kukai.app](https://${this.getHostName()}/direct-auth)`);
    return `https://www.reddit.com/message/compose?to=${message.username}&subject=${subject}&message=${body}`;
  }
  twitterPmFormat(message: any) {
    // https://twitter.com/messages/compose?recipient_id=USER_ID&text=MESSAGE
    const body = this.encodedBody(message.amount, 'Twitter', `https://${this.getHostName()}/direct-auth`);
    return `https://twitter.com/messages/compose?recipient_id=${message.twitterId}&text=${body}`;
  }
  encodedBody(amount: string, accountType: string, url: string): string {
    const s = (accountType === 'Reddit') ? '  ' : '';
    const b = (accountType === 'Reddit') ? '**' : '';
    const t = (accountType === 'Twitter') ? 'Tezos ' : '';
    return encodeURI(`Hi,${s}\nI sent you ${b}${amount}${b} using the Kukai wallet.\n\nYou can access your ${t}wallet with your ${accountType} account at: ${url}`);
  }
  getAlias(message: any) {
    return message.email ? message.email :
      message.username ? message.username :
      message.handler ? message.handler :
      'recipient';
  }
}
