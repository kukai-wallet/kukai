import { Component, OnInit, Input } from '@angular/core';
import { MessageService } from '../../services/message/message.service';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {
  @Input() embedded: boolean;
  logo = 'default';
  constructor(public messageService: MessageService) { }

  ngOnInit(): void {
    this.messageService.origin.subscribe((o) => {
      if (o?.endsWith('truesy.com')) {
        this.logo = 'truesy';
      } else if (o?.endsWith('playwithbrio.com')) {
        this.logo = 'brio';
      } else if (o?.indexOf('minterpop') !== -1) {
        this.logo = 'minterPop';
      } else {
        this.logo = 'default';
      }
    });
  }
}
