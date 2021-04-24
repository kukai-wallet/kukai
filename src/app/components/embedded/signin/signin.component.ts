import { EventEmitter, Input, Output, SimpleChanges, Component, OnInit, OnChanges } from '@angular/core';
import { LoginConfig } from 'kukai-embed';
import { MessageService } from '../../../services/message/message.service';
import { TorusService } from '../../../services/torus/torus.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit, OnChanges {
  @Input() dismiss: Boolean;
  @Input() loginConfig: LoginConfig;
  @Output() loginResponse = new EventEmitter();
  constructor(
    private messageService: MessageService,
    public torusService: TorusService
  ) { }
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
      //const loginData = await this.mockLogin(); // Mock locally
      const loginData = await this.torusService.loginTorus(typeOfLogin);
      if (this.dismiss === null) {
        await this.messageService.stopSpinner();
      }
      this.loginResponse.emit(loginData);
    } catch {
      await this.messageService.stopSpinner();
    }
  }
  private async mockLogin(): Promise<any> {
    const keyPair = {
      sk: 'spsk1VfCfhixtzGvUSKDre6jwyGbXFm6aoeLGnxeVLCouueZmkgtJF',
      pk: 'sppk7cZsZeBApsFgYEdWuSwj92YCWkJxMmBfkN3FeKRmEB7Lk5pmDrT',
      pkh: 'tz2WKg52VqnYXH52TZbSVjT4hcc8YGVKi7Pd'
    };
    const userInfo = {
      typeOfLogin: 'google',
      verifierId: 'mock.user@gmail.com',
      name: 'Mock User'
    };
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ keyPair, userInfo });
      }, 2000);
    });
  }
}
