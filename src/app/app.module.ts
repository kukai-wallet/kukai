import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

import { MessagesComponent } from './components/messages/messages.component';
import { MessageService } from './services/message.service';
import { WalletService } from './services/wallet.service';
import { ActivityService } from './services/activity.service';
import { BalanceService } from './services/balance.service';
import { EncryptionService } from './services/encryption.service';
import { FaucetService } from './services/faucet.service';
import { TransactionService } from './services/transaction.service';

import { AppComponent } from './app.component';
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
    NewAccountComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [MessageService, WalletService, ActivityService, EncryptionService, FaucetService, BalanceService, TransactionService],
  bootstrap: [AppComponent]
})
export class AppModule { }
