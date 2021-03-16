import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { MessageService } from '../../services/message/message.service';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit, AfterContentChecked {

  constructor(public messageService: MessageService) { }

  ngOnInit(): void {
  }
  ngAfterContentChecked(): void {
    if (!this.messageService.spinnerOn) {
      this.messageService.spinnerChecked();
    }
  }
}
