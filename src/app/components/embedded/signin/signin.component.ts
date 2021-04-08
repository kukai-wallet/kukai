import { EventEmitter, Output } from '@angular/core';
import { HostListener } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../../services/message/message.service';
import { TorusService } from '../../../services/torus/torus.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  @Output() loginResponse = new EventEmitter();
  @HostListener('click', ['$event'])
  onClick(ev) {
    if (ev?.target?.localName === 'app-signin') {
      this.abort();
    }
  }
  constructor(
    private messageService: MessageService,
    public torusService: TorusService
  ) { }

  ngOnInit(): void {
  }
  abort() {
    this.loginResponse.emit(null);
  }
  async login(typeOfLogin: string) {
    try {
      this.messageService.startSpinner('Loading wallet...');
      //const loginData = await this.mockLogin(); // Mock locally
      const loginData = await this.torusService.loginTorus(typeOfLogin);
      await this.messageService.stopSpinner();
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
