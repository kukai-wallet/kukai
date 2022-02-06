import { Component, OnInit } from '@angular/core';
import { ModalComponent } from '../../../../components/modals/modal.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['../../../../../scss/components/views/layouts/footer/footer.component.scss']
})
export class FooterComponent implements OnInit {
  darkText = false;
  path = '';
  ModalComponent = ModalComponent;
  constructor() {}

  ngOnInit(): void {}
  promptTelegramDialog(ev) {
    ev.preventDefault();
    ModalComponent.currentModel.next({
      name: 'info',
      data: {
        href: 'https://t.me/KukaiWallet',
        message: `Social engineering attacks are currently a high threat on Telegram.

• Do not answer anyone that sends you private messages or calls you

• Do not click on any links in a private message, or share your seed words with anyone`,
        title: 'Security Notice'
      }
    });
  }
}
