import { Component, OnInit } from '@angular/core';

import { MessageService } from '../../services/message.service';
import { OperationService } from '../../services/operation.service';
import { InputValidationService } from '../../services/input-validation.service';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  styleUrls: ['./activate.component.scss']
})
export class ActivateComponent implements OnInit {
  pkh: string;
  secret: string;
  formInvalid = '';
  constructor(
    private messageService: MessageService,
    private operationService: OperationService,
    private inputValidationService: InputValidationService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
  }
  activate() {
    this.formInvalid = this.checkInput();
    if (!this.formInvalid) {
      const pkh = this.pkh;
      const secret = this.secret;
      this.pkh = '';
      this.secret = '';
      this.operationService.activate(pkh, secret).subscribe(
        (ans: any) => {
          if (ans.success) {
            if (ans.payload.opHash) {

              let activationSuccess = '';
              this.translate.get('ACTIVATECOMPONENT.ACTIVATESUCCESS').subscribe(
                  (res: string) => activationSuccess = res
              );
              this.messageService.addSuccess(activationSuccess);  // 'Activation successfully broadcasted to the blockchain!'

            } else {

              let retrieveFailed = '';
              this.translate.get('ACTIVATECOMPONENT.RETRIEVEFAIL').subscribe(
                  (res: string) => retrieveFailed = res
              );
              this.messageService.addWarning(retrieveFailed);  // Could not retrieve an operation hash
            }
          } else {
            let errorMessage = '';
            if (typeof ans.payload.msg === 'string') {
              errorMessage = 'NodeError ' + ans.payload.msg;
            } else {
              errorMessage = 'NodeError ' + JSON.stringify(ans.payload.msg);
            }
            this.messageService.addError(errorMessage);
            console.log(JSON.stringify(ans.payload.msg));
          }
        },
        err => {
          let errorMessage = '';
          let activateFailed = '';
          this.translate.get('ACTIVATECOMPONENT.ACTIVATEFAIL').subscribe(
              (res: string) => activateFailed = res  // 'Failed to activate wallet!'
          );

          if (typeof err.payload.msg === 'string') {
            errorMessage = activateFailed + ' ' + err.payload.msg;
          } else {
            errorMessage = activateFailed;
          }
          this.messageService.addError(activateFailed);
          console.log(JSON.stringify(err));
        }
      );
    }
  }
  checkInput(): string {
    if (!this.inputValidationService.address(this.pkh)) {
      return 'Invalid public key hash!';
    } else if (!this.inputValidationService.code(this.secret)) {
      return 'Invalid activation code!';
    }
    return '';
  }
}
