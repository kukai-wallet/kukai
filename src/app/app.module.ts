import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

// From Angular Material
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// For translation
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// External libraries
import { AppComponent } from './app.component';

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
import { BeaconService } from './services/beacon/beacon.service';
import { TorusService } from './services/torus/torus.service';
import { EmbeddedAuthService } from './services/embedded-auth/embedded-auth.service';
import { TokenBalancesService } from './services/token-balances/token-balances.service';
import { SubjectService } from './services/subject/subject.service';

// View components
import { StartComponent } from './components/start/start.component';
import { NewWalletComponent } from './components/start/login-types/new-wallet/new-wallet.component';
import { MnemonicImportComponent } from './components/start/login-types/mnemonic-import/mnemonic-import.component';
import { CoordinatorService } from './services/coordinator/coordinator.service';
import { OperationService } from './services/operation/operation.service';
import { MessagesComponent } from './components/messages/messages.component';
import { ModalComponent } from './components/modal/modal.component';
import { HeaderComponent } from './components/header/header.component';
import { ConnectLedgerComponent } from './components/start/login-types/connect-ledger/connect-ledger.component';
import { FooterComponent } from './components/footer/footer.component';
import { AccountViewComponent } from './components/account-view/account-view.component';
import { ActivityComponent } from './components/account-view/activity/activity.component';
import { EventComponent } from './components/account-view/activity/event/event.component';
import { NftsComponent } from './components/account-view/nfts/nfts.component';
import { PendingComponent } from './components/account-view/pending/pending.component';
import { BalancesComponent } from './components/account-view/balances/balances.component';
import { BalanceTokenComponent } from './components/account-view/balances/token/balance-token.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { AgreementComponent } from './components/agreement/agreement.component';
import { TermsOfUseComponent } from './components/agreement/terms-of-use/terms-of-use.component';
import { PrivacyPolicyComponent } from './components/agreement/privacy-policy/privacy-policy.component';
import { EmbeddedComponent } from './components/embedded/embedded.component';
import { SigninComponent } from './components/embedded/signin/signin.component';
import { CardComponent } from './components/embedded/card/card.component';
import { SendButtonComponent } from './components/ui/button/basic/send/send-button.component';
import { TokenDetail } from './components/modal/send/detail/token-detail.component';
import { AlertComponent } from './components/modal/alert/alert.component';
import { SpinnerLegacyComponent } from './components/spinner/legacy/spinner-legacy.component';
import { SpinnerNewComponent } from './components/spinner/new/spinner-new.component';
import { AccountDropdownComponent } from './components/ui/dropdown/account/account-dropdown.component';
import { MobileMenuDropdownComponent } from './components/ui/dropdown/mobile-menu/mobile-menu.component';
import { P404Component } from './components/error/404.component';
import { P500Component } from './components/error/500.component';

// Modules
import { LoggedInModule } from './components/logged-in/logged-in.module';

// Pipes
import { ErrorHandlingPipe } from './pipes/error-handling.pipe';
import { DelegatorNamePipe } from './pipes/delegator-name.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { DeeplinkService } from './services/deeplink/deeplink.service';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,

    // View components
    NewWalletComponent,
    StartComponent,
    MnemonicImportComponent,
    MessagesComponent,
    ModalComponent,
    HeaderComponent,
    P404Component,
    P500Component,
    SendButtonComponent,
    ConnectLedgerComponent,
    FooterComponent,
    AccountViewComponent,
    ActivityComponent,
    EventComponent,
    NftsComponent,
    PendingComponent,
    BalancesComponent,
    BalanceTokenComponent,
    SpinnerComponent,
    AgreementComponent,
    TermsOfUseComponent,
    PrivacyPolicyComponent,
    EmbeddedComponent,
    SigninComponent,
    CardComponent,
    TokenDetail,
    SpinnerLegacyComponent,
    SpinnerNewComponent,
    AccountDropdownComponent,
    MobileMenuDropdownComponent,
    SpinnerLegacyComponent,

    // Modals
    ModalComponent,
    AlertComponent,

    // Pipes
    ErrorHandlingPipe,
    DelegatorNamePipe,
    TruncatePipe,
    TimeAgoPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    LoggedInModule,
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
    TzrateService,
    CoordinatorService,
    OperationService,
    ExportService,
    DelegateService,
    InputValidationService,
    LedgerService,
    BeaconService,
    TorusService,
    EmbeddedAuthService,
    SubjectService,
    TokenBalancesService,
    DeeplinkService,

    // Pipes
    ErrorHandlingPipe,
    DelegatorNamePipe,
    TruncatePipe,
    TimeAgoPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }