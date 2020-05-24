import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { BsModalService } from 'ngx-bootstrap/modal';

// From Angular Material
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// For translation
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

// External libraries
import { ComponentLoaderFactory } from 'ngx-bootstrap/component-loader';
import { ModalModule, AlertModule, ProgressbarModule, ButtonsModule, BsDropdownModule, TabsModule } from 'ngx-bootstrap';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { AppComponent } from './app.component';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

import { ChartsModule } from 'ng2-charts';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

import {
  AppAsideModule,
  AppBreadcrumbModule,
  AppSidebarModule,
} from '@coreui/angular';

// Services
import { MessageService } from './services/message/message.service';
import { WalletService } from './services/wallet/wallet.service';
import { ActivityService } from './services/activity/activity.service';
import { BalanceService } from './services/balance/balance.service';
import { EncryptionService } from './services/encryption/encryption.service';
import { ImportService } from './services/import/import.service';
import { TzrateService } from './services/tzrate/tzrate.service';
import { ExportService } from './services/export/export.service';
import { DelegateService } from './services/delegate/delegate.service';
import { InputValidationService } from './services/input-validation/input-validation.service';
import { LedgerService } from './services/ledger/ledger.service';
import { EstimateService } from './services/estimate/estimate.service';

// View components
import { ImportComponent } from './components/import/import.component';
import { StartComponent } from './components/start/start.component';
import { ActivityComponent } from './components/activity/activity.component';
import { OverviewComponent } from './/components/overview/overview.component';
import { SendComponent } from './components/send/send.component';
import { NewAccountComponent } from './components/new-account/new-account.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { NewWalletComponent } from './components/new-wallet/new-wallet.component';
import { ReceiveComponent } from './components/receive/receive.component';
import { DelegateComponent } from './components/delegate/delegate.component';
import { PositioningService } from 'ngx-bootstrap/positioning';
import { AccountComponent } from './components/account/account.component';
import { MnemonicImportComponent } from './components/mnemonic-import/mnemonic-import.component';
import { CoordinatorService } from './services/coordinator/coordinator.service';
import { OperationService } from './services/operation/operation.service';
import { BakeryComponent } from './components/bakery/bakery.component';
import { ActivateComponent } from './components/activate/activate.component';
import { MessagesComponent } from './components/messages/messages.component';
import { CommunityComponent } from './components/community/community.component';
import { HeaderComponent } from './components/header/header.component';
import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';

// Pipes
import { ErrorHandlingPipe } from './pipes/error-handling.pipe';
import { DelegatorNamePipe } from './pipes/delegator-name.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { ConnectLedgerComponent } from './components/connect-ledger/connect-ledger.component';
import { FooterComponent } from './components/footer/footer.component';

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
    ImportComponent,
    StartComponent,
    ActivityComponent,
    OverviewComponent,
    SendComponent,
    NewAccountComponent,
    ReceiveComponent,
    DelegateComponent,
    AccountComponent,
    MnemonicImportComponent,
    BakeryComponent,
    ActivateComponent,
    MessagesComponent,
    CommunityComponent,
    HeaderComponent,
    P404Component,
    P500Component,

    // Pipes
    ErrorHandlingPipe,
    DelegatorNamePipe,
    TruncatePipe,
    TimeAgoPipe,
    ConnectLedgerComponent,
    FooterComponent,
  ],
  imports: [
    AppAsideModule,
    AppBreadcrumbModule,
    AppSidebarModule,
    BrowserModule,
    BrowserAnimationsModule,
    ChartsModule,
    MatTabsModule,
    MatSortModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    CollapseModule.forRoot(),
    ModalModule.forRoot(),
    AlertModule.forRoot(),
    PerfectScrollbarModule,
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
    InputValidationService,
    LedgerService,
    EstimateService,

    // Pipes
    ErrorHandlingPipe,
    DelegatorNamePipe,
    TruncatePipe,
    TimeAgoPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
