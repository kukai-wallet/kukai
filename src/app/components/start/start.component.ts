import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../services/wallet/wallet.service';
import { ActivatedRoute } from '@angular/router';
import { DeeplinkService } from '../../services/deeplink/deeplink.service';
import 'rxjs/add/operator/filter';
import { Location } from '@angular/common';
import { TorusService } from '../../services/torus/torus.service';
import { MessageService } from '../../services/message/message.service';
import { ImportService } from '../../services/import/import.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['../../../scss/components/start/start.component.scss']
})
export class StartComponent implements OnInit {
  constructor(
    private walletService: WalletService,
    public translate: TranslateService,
    public torusService: TorusService,
    private importService: ImportService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private deeplinkService: DeeplinkService,
    private location: Location
  ) {
  }
  animationActive = true;

  async ngOnInit() {
    this.route.queryParams
      .filter(params => params.type)
      .subscribe(params => {
        this.deeplinkService.set(params);
        this.location.replaceState('');
      }
      );
  }

  async torusLogin(verifier: string) {
    await this.torusService.initTorus();
    await this.messageService.startSpinner('Loading wallet...');
    const { keyPair, userInfo } = await this.torusService.loginTorus(verifier).catch(async (e) =>
      await this.messageService.stopSpinner()
    );
    console.log('login done');
    if (keyPair) {
      await this.importService
        .importWalletFromPk(keyPair.pk, '', { verifier: userInfo.typeOfLogin, id: userInfo.verifierId, name: userInfo.name })
        .then((success: boolean) => {
          if (success) {
            console.log('success');
            this.router.navigate([`/account/`]);
            this.messageService.stopSpinner();
          } else {
            this.messageService.addError('Torus import failed');
            this.messageService.stopSpinner();
          }
        });
    } else {
      await this.messageService.stopSpinner();
    }
  }
}
