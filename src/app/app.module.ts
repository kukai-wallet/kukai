import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { BsModalService } from 'ngx-bootstrap/modal';

// External libraries
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ComponentLoaderFactory } from 'ngx-bootstrap/component-loader/component-loader.factory';
import { ModalModule, AlertModule } from 'ngx-bootstrap';

// Services
import { MessagesComponent } from './components/messages/messages.component';
import { MessageService } from './services/message.service';
import { WalletService } from './services/wallet.service';
import { ActivityService } from './services/activity.service';
import { BalanceService } from './services/balance.service';
import { EncryptionService } from './services/encryption.service';
import { FaucetService } from './services/faucet.service';
import { TransactionService } from './services/transaction.service';
import { ImportService } from './services/import.service';

import { AppComponent } from './app.component';

// View components
import { BroadcastComponent } from './components/broadcast/broadcast.component';
import { ImportComponent } from './components/import/import.component';
import { StartComponent } from './components/start/start.component';
import { ActivityComponent } from './components/activity/activity.component';
import { AccountsComponent } from './/components/accounts/accounts.component';
import { BackupComponent } from './components/backup/backup.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SendComponent } from './components/send/send.component';
import { NewAccountComponent } from './components/new-account/new-account.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { NewWalletComponent } from './components/new-wallet/new-wallet.component';
import { ReceiveComponent } from './components/receive/receive.component';
import { DelegateComponent } from './components/delegate/delegate.component';
import { PositioningService } from 'ngx-bootstrap/positioning';


@NgModule({
  declarations: [
    HomePageComponent,
    NewWalletComponent,
    MessagesComponent,
    AppComponent,
    BroadcastComponent,
    ImportComponent,
    StartComponent,
    ActivityComponent,
    AccountsComponent,
    BackupComponent,
    SettingsComponent,
    SendComponent,
    NewAccountComponent,
    ReceiveComponent,
    DelegateComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule.forRoot(),
    ModalModule.forRoot(),
    AlertModule.forRoot()
  ],
  providers: [
    MessageService,
    WalletService,
    ActivityService,
    EncryptionService,
    FaucetService,
    BalanceService,
    TransactionService,
    ImportService,
    BsModalService,
    ComponentLoaderFactory,
    PositioningService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
