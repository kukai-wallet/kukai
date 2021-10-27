import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../../services/message/message.service';
import { TorusService } from '../../../services/torus/torus.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['../../../../scss/components/ui/messages/messages.component.scss']
})
export class MessagesComponent implements OnInit {
  constructor(
    public messageService: MessageService,
    public torusService: TorusService
    ) { }
  ngOnInit(): void {
  }
}
