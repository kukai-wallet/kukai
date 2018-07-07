import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { BsModalService } from 'ngx-bootstrap/modal';

// External libraries
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ComponentLoaderFactory } from 'ngx-bootstrap/component-loader/component-loader.factory';
import { ModalModule, AlertModule, ProgressbarModule, ButtonsModule, BsDropdownModule, TabsModule } from 'ngx-bootstrap';

import { AppComponent } from './app.component';

// Services
import { MessagesComponent } from './components/messages/messages.component';
import { MessageService } from './services/message.service';
import { WalletService } from './services/wallet.service';
import { ActivityService } from './services/activity.service';
import { BalanceService } from './services/balance.service';
import { EncryptionService } from './services/encryption.service';
import { ImportService } from './services/import.service';
import { TzrateService } from './services/tzrate.service';
import { ExportService } from './services/export.service';
import { DelegateService } from './services/delegate.service';
import { TzscanService } from './services/tzscan.service';

// View components
import { OfflineSigningComponent } from './components/offline-signing/offline-signing.component';
import { ImportComponent } from './components/import/import.component';
import { StartComponent } from './components/start/start.component';
import { ActivityComponent } from './components/activity/activity.component';
import { OverviewComponent } from './/components/overview/overview.component';
import { BackupComponent } from './components/backup/backup.component';
import { SendComponent } from './components/send/send.component';
import { NewAccountComponent } from './components/new-account/new-account.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { NewWalletComponent } from './components/new-wallet/new-wallet.component';
import { ReceiveComponent } from './components/receive/receive.component';
import { DelegateComponent } from './components/delegate/delegate.component';
import { PositioningService } from 'ngx-bootstrap/positioning';
import { AccountComponent } from './components/account/account.component';
import { MnemonicImportComponent } from './components/mnemonic-import/mnemonic-import.component';
import { CoordinatorService } from './services/coordinator.service';
import { OperationService } from './services/operation.service';
import { BakeryComponent } from './components/bakery/bakery.component';
import { ActivateComponent } from './components/activate/activate.component';

// Pipes
import { ErrorHandlingPipe } from './pipes/error-handling.pipe';


@NgModule({
  declarations: [
    HomePageComponent,
    NewWalletComponent,
    MessagesComponent,
    AppComponent,
    OfflineSigningComponent,
    ImportComponent,
    StartComponent,
    ActivityComponent,
    OverviewComponent,
    BackupComponent,
    SendComponent,
    NewAccountComponent,
    ReceiveComponent,
    DelegateComponent,
    AccountComponent,
    MnemonicImportComponent,
    BakeryComponent,
    ActivateComponent,
    ErrorHandlingPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule.forRoot(),
    ModalModule.forRoot(),
    AlertModule.forRoot(),
    ProgressbarModule.forRoot(),
    ButtonsModule.forRoot(),
    BsDropdownModule.forRoot(),
    TabsModule.forRoot()
  ],
  providers: [
    MessageService,
    WalletService,
    ActivityService,
    EncryptionService,
    BalanceService,
    ImportService,
    BsModalService,
    ComponentLoaderFactory,
    PositioningService,
    TzrateService,
    CoordinatorService,
    OperationService,
    ExportService,
    DelegateService,
    TzscanService,
    ErrorHandlingPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
