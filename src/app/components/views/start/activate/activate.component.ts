import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from '../../../../services/message/message.service';
import { OperationService } from '../../../../services/operation/operation.service';
import { InputValidationService } from '../../../../services/input-validation/input-validation.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  styleUrls: ['../../../../../scss/components/views/start/login.component.scss']
})
export class ActivateComponent implements OnInit, OnDestroy {
  pkh: string;
  secret: string;
  formInvalid = '';
  private subscriptions: Subscription = new Subscription();
  constructor(
    private messageService: MessageService,
    private operationService: OperationService,
    private inputValidationService: InputValidationService,
    private translate: TranslateService
  ) {}

  ngOnInit() {}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  activate(): void {
    this.formInvalid = this.checkInput();
    if (!this.formInvalid) {
      const pkh = this.pkh;
      const secret = this.secret;
      this.pkh = '';
      this.secret = '';
      this.subscriptions.add(
        this.operationService.activate(pkh, secret).subscribe(
          (ans: any) => {
            if (ans.success) {
              if (ans.payload.opHash) {
                this.subscriptions.add(
                  this.translate.get('ACTIVATECOMPONENT.ACTIVATESUCCESS').subscribe(
                    (res: string) => this.messageService.addSuccess(res) // 'Activation successfully broadcasted to the blockchain!'
                  )
                );
              } else {
                this.subscriptions.add(
                  this.translate.get('ACTIVATECOMPONENT.RETRIEVEFAIL').subscribe(
                    (res: string) => this.messageService.addWarning(res) // Could not retrieve an operation hash
                  )
                );
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
          (err) => {
            this.subscriptions.add(
              this.translate.get('ACTIVATECOMPONENT.ACTIVATEFAIL').subscribe(
                (res: string) => {
                  let errorMessage = '';
                  const activateFailed = res;
                  if (typeof err.payload.msg === 'string') {
                    errorMessage = activateFailed + ' ' + err.payload.msg;
                  } else {
                    errorMessage = activateFailed;
                  }
                  this.messageService.addError(errorMessage);
                } // 'Failed to activate wallet!'
              )
            );
            console.log(JSON.stringify(err));
          }
        )
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
