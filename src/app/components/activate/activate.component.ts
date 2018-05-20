import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { OperationService } from '../../services/operation.service';

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  styleUrls: ['./activate.component.scss']
})
export class ActivateComponent implements OnInit {

  constructor(
    private messageService: MessageService,
    private operationService: OperationService
  ) { }

  ngOnInit() {
  }
  activate(pkh: string, secret: string) {
    this.operationService.activate(pkh, secret).subscribe(
      (ans: any) => {
        if (ans.opHash) {
          this.messageService.addSuccess('Wallet activated!');
        } else {
          this.messageService.addWarning('Couldn\'t retrive an operation hash');
        }
      },
      err => {
        this.messageService.addError('Failed to activate wallet!');
        console.log(JSON.stringify(err));
      }
    );
  }
}
