import { EventEmitter, Input, Output, SimpleChanges, Component, OnInit, OnChanges } from '@angular/core';
import { LoginConfig } from 'kukai-embed';
import { MessageService } from '../../../../services/message/message.service';
import { TorusService } from '../../../../services/torus/torus.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['../../../../../scss/components/views/embedded/signin/signin.component.scss']
})
export class SigninComponent implements OnInit, OnChanges {
  constructor(
    private messageService: MessageService,
    public torusService: TorusService
  ) { }
  @Input() dismiss: Boolean;
  @Input() loginConfig: LoginConfig;
  @Output() loginResponse = new EventEmitter();
  loginOptions = [];
  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.dismiss?.currentValue === true) {
      this.messageService.stopSpinner().then(() => this.loginResponse.emit('dismiss'));
    }
    if (changes?.loginConfig?.currentValue) {
      if (this.loginConfig.loginOptions?.length > 0) {
        this.loginOptions = [];
        for (const loginOption of this.loginConfig.loginOptions) {
          if (this.torusService.verifierMapKeys.includes(loginOption)) {
            this.loginOptions.push(loginOption);
          }
        }
      } else {
        this.loginOptions = this.torusService.verifierMapKeys;
      }
    }
  }
  abort() {
    this.loginResponse.emit(null);
  }
  async login(typeOfLogin: string) {
    try {
      this.messageService.startSpinner('Loading wallet...');
      const loginData = await this.torusService.loginTorus(typeOfLogin);
      if (!loginData?.keyPair) {
        throw new Error('Login failed');
      }
      if (this.dismiss === null) {
        await this.messageService.stopSpinner();
      }
      this.loginResponse.emit(loginData);
    } catch {
      await this.messageService.stopSpinner();
    }
  }
}
