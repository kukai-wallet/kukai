import { EventEmitter, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../../services/message/message.service';
import { TorusService } from '../../../services/torus/torus.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  loading = false;
  @Output() loginResponse = new EventEmitter();
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
      this.messageService.startSpinner('Mocking DirectAuth wallet...');
      const loginData = await this.mockLogin(); // Mock locally
      //const loginData = this.torusService.loginTorus(typeOfLogin);
      this.loginResponse.emit(loginData);
    } finally {
      this.messageService.stopSpinner();
    }
  }
  private async mockLogin(): Promise<any> {
    const keyPair = {
      sk: "spsk3A8C3viEfeZ2uJgv1RjuWGAgHTJNDS7EgpNfMXoP5e7DCTeBwA",
      pk: "sppk7cZQHLuxcGM4eAJuTzvUsXz5GY25EyHGx73645XL8RDe99bcpnH",
      pkh: "tz2RAaUUKkejGWvLyxeB75YnFDMULBws2g2M"
    }
    const userInfo = {
      typeOfLogin: 'google',
      verifierId: 'klas@kukai.app',
      name: 'Klas'
    };
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ keyPair, userInfo });
      }, 2000);
    })
  }
}
