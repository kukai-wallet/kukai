import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { BsModalService } from 'ngx-bootstrap/modal';

// From Angular Material
import { MatSortModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


// For translation
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

// External libraries
import { ComponentLoaderFactory } from 'ngx-bootstrap/component-loader';
import { ModalModule, AlertModule, ProgressbarModule, ButtonsModule, BsDropdownModule, TabsModule } from 'ngx-bootstrap';
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { AppComponent } from './app.component';

// Services
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
import { InputValidationService } from './services/input-validation.service';
import { LedgerService } from './services/ledger.service';

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
import { MessagesComponent } from './components/messages/messages.component';  // Empty
import { VotingComponent } from './components/voting/voting.component';
import { CommunityComponent } from './components/community/community.component';
import { BakersListComponent } from './components/bakers-list/bakers-list.component';

// Pipes
import { ErrorHandlingPipe } from './pipes/error-handling.pipe';
import { DelegatorNamePipe } from './pipes/delegator-name.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { ConnectLedgerComponent } from './components/connect-ledger/connect-ledger.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}



@NgModule({
  declarations: [
    AppComponent,

    // View components
    HomePageComponent,
    NewWalletComponent,
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
    MessagesComponent,  // Empty
    VotingComponent,
    CommunityComponent,
    BakersListComponent,

    // Pipes
    ErrorHandlingPipe,
    DelegatorNamePipe,
    TruncatePipe,
    TimeAgoPipe,
    ConnectLedgerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatSortModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    CollapseModule.forRoot(),
    ModalModule.forRoot(),
    AlertModule.forRoot(),
    ProgressbarModule.forRoot(),
    ButtonsModule.forRoot(),
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
    }
    })  // lazy loading will need TranslateModule.forChild() in the lazy loaded modules
  ],
  providers: [
    // Services
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
    InputValidationService,
    LedgerService,

    // Pipes
    ErrorHandlingPipe,
    DelegatorNamePipe,
    TruncatePipe,
    TimeAgoPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
