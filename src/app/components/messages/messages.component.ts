import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MessageService } from '../../services/message/message.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  constructor(
    public messageService: MessageService,
    private location: Location
    ) { }

  ngOnInit() {
  }
  removeMessage(index: number) {
    this.messageService.messages.splice(index, 1);
  }
  getHostName() {
    return location.hostname;
  }
}
