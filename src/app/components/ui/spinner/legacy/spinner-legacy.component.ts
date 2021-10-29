import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../../../services/message/message.service';

@Component({
  selector: 'app-spinner-legacy',
  templateUrl: './spinner-legacy.component.html',
  styleUrls: ['./spinner-legacy.component.scss']
})
export class SpinnerLegacyComponent implements OnInit {

  constructor(public messageService: MessageService) { }

  ngOnInit(): void {
  }

}
