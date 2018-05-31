import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { OperationService } from '../../services/operation.service';

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  styleUrls: ['./activate.component.scss']
})
export class ActivateComponent implements OnInit {
  pkh: string;
  secret: string;
  constructor(
    private messageService: MessageService,
    private operationService: OperationService
  ) { }

  ngOnInit() {
  }
  activate() {
    const pkh = this.pkh;
    const secret = this.secret;
    this.pkh = '';
    this.secret = '';
    this.operationService.activate(pkh, secret).subscribe(
      (ans: any) => {
        if (ans.success) {
          if (ans.payload.opHash) {
            this.messageService.addSuccess('Wallet activated!');
          } else {
            this.messageService.addWarning('Couldn\'t retrive an operation hash');
          }
        } else {
          let errorMessage = '';
          if (typeof ans.payload.msg === 'string') {
            errorMessage = 'NodeError ' + ans.payload.msg;
          } else {
            errorMessage = 'NodeError';
          }
          this.messageService.addError(errorMessage);
          console.log(JSON.stringify(ans.payload.msg));
        }
      },
      err => {
        let errorMessage = '';
        if (typeof err.payload.msg === 'string') {
          errorMessage = 'Failed to activate wallet! ' + err.payload.msg;
        } else {
          errorMessage = 'Failed to activate wallet!';
        }
        this.messageService.addError('Failed to activate wallet!');
        console.log(JSON.stringify(err));
      }
    );
  }
}
