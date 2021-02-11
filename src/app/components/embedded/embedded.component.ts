import { Component, OnInit } from '@angular/core';
import { TorusService } from '../../services/torus/torus.service';
import { CONSTANTS } from '../../../environments/environment';

@Component({
  selector: 'app-embedded',
  templateUrl: './embedded.component.html',
  styleUrls: ['./embedded.component.scss']
})
export class EmbeddedComponent implements OnInit {
  allowedOrigins = ['http://localhost', 'https://www.tezos.help'];
  origin = '';
  login = false;
  constructor(
    private torusService: TorusService
  ) { }

  ngOnInit(): void {
    document.body.style.background = 'none';
    this.torusService.initTorus();
    if (window.addEventListener) {
      window.addEventListener('message', this.handleRequest, false);
    } else {
      (window as any).attachEvent('onmessage', this.handleRequest);
    }
    console.log('icabod is connected...');
  }
  handleRequest = (evt) => {
    try {
      const data = JSON.parse(evt.data);
      if (this.allowedOrigins.includes(evt.origin)) {
        this.origin = evt.origin
        console.log(`Received ${evt.data} from ${evt.origin}`);
        if (data && data.request === 'login' && data.network === CONSTANTS.NETWORK && /* restricted to testnet for now */data.network === 'delphinet') {
          this.login = true;
        }
      } else if (data && data.request === 'login') {
        console.log(`Invalid origin (${evt.origin})`);
      }
    } catch (e) { }
  }
  loginResponse(loginData: any) {
    if (loginData) {
      const { keyPair, userInfo } = loginData;
      const response = JSON.stringify({
        // userInfo
        response: 'login',
        pk: keyPair.pk,
        pkh: keyPair.pkh
      });
      window.parent.window.postMessage(response, this.origin);
    } else {
      this.abort();
    }
    this.login = false;
  }
  abort() {
    const msg = JSON.stringify({ response: 'login', failed: true, error: 'ABORTED_BY_USER' });
    window.parent.window.postMessage(msg, this.origin);
  }
}
