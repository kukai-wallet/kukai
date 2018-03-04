import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { HomePageComponent } from './components/home-page/home-page.component';
import { NewWalletComponent } from './components/new-wallet/new-wallet.component';
import { MessagesComponent } from './components/messages/messages.component';
import { MessageService } from './services/message.service';
import { WalletService } from './services/wallet.service';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BroadcastComponent } from './components/broadcast/broadcast.component';
import { ImportComponent } from './components/import/import.component';
import { StartComponent } from './components/start/start.component';
import { ActivityComponent } from './components/activity/activity.component';
import { AccountsComponent } from './/components/accounts/accounts.component';
import { BackupComponent } from './components/backup/backup.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SendComponent } from './components/send/send.component';
import { TzscanService } from './services/tzscan.service';
import { NewAccountComponent } from './components/new-account/new-account.component';


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
  providers: [MessageService, WalletService, TzscanService],
  bootstrap: [AppComponent]
})
export class AppModule { }
