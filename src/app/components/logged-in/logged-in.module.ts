import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LocationStrategy, HashLocationStrategy, CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClient } from '@angular/common/http';

// // From Angular Material
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// // For translation
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// // External libraries
// import { AppComponent } from '../../app.component';

// Services
// import { MessageService } from '../../services/message/message.service';
// import { WalletService } from '../../services/wallet/wallet.service';
// import { ActivityService } from '../../services/activity/activity.service';
// import { BalanceService } from '../../services/balance/balance.service';
// import { EncryptionService } from '../../services/encryption/encryption.service';
// import { ImportService } from '../../services/import/import.service';
// import { TzrateService } from '../../services/tzrate/tzrate.service';
// import { ExportService } from '../../services/export/export.service';
// import { DelegateService } from '../../services/delegate/delegate.service';
// import { InputValidationService } from '../../services/input-validation/input-validation.service';
// import { LedgerService } from '../../services/ledger/ledger.service';
import { EstimateService } from '../../services/estimate/estimate.service';
import { BeaconService } from '../../services/beacon/beacon.service';
// import { TorusService } from '../../services/torus/torus.service';
// import { EmbeddedAuthService } from '../../services/embedded-auth/embedded-auth.service';
import { TokenBalancesService } from '../../services/token-balances/token-balances.service';
// import { SubjectService } from '../../services/subject/subject.service';

// View components
// import { StartComponent } from '../../components/start/start.component';
import { SendComponent } from '../../components/send/send.component'; /* ** */
// import { NewWalletComponent } from '../../components/start/login-types/new-wallet/new-wallet.component';
import { ReceiveComponent } from '../../components/modal/receive/receive.component'; /* ** */
import { DelegateComponent } from '../../components/modal/delegate/delegate.component'; /* ** */
import { DelegatePageComponent } from '../../components/delegate-page/delegate-page.component';
// import { MnemonicImportComponent } from '../../components/start/login-types/mnemonic-import/mnemonic-import.component';
// import { CoordinatorService } from '../../services/coordinator/coordinator.service';
// import { OperationService } from '../../services/operation/operation.service';
import { ActivateComponent } from '../../components/activate/activate.component';
// import { MessagesComponent } from '../../components/messages/messages.component';
// import { ModalComponent } from '../../components/modal/modal.component';
// import { HeaderComponent } from '../../components/header/header.component';
// import { P404Component } from '../../views/error/404.component';
// import { P500Component } from '../../views/error/500.component';
// import { ConnectLedgerComponent } from '../../components/start/login-types/connect-ledger/connect-ledger.component';
// import { FooterComponent } from '../../components/footer/footer.component';
// import { AccountViewComponent } from '../../components/account-view/account-view.component';
// import { ActivityComponent } from '../../components/account-view/activity/activity.component';
// import { NftsComponent } from '../../components/account-view/nfts/nfts.component';
// import { PendingComponent } from '../../components/account-view/pending/pending.component';
// import { BalancesComponent } from '../../components/account-view/balances/balances.component';
import { NewImplicitComponent } from '../../components/modal/new-implicit/new-implicit.component'; /* ** */
// import { SpinnerComponent } from '../../components/spinner/spinner.component';
// import { AgreementComponent } from '../../components/agreement/agreement.component';
// import { TermsOfUseComponent } from '../../components/agreement/terms-of-use/terms-of-use.component';
// import { PrivacyPolicyComponent } from '../../components/agreement/privacy-policy/privacy-policy.component';
// import { TorusComponent } from '../../components/start/login-types/torus/torus.component';
import { UriHandlerComponent } from '../../components/uri-handler/uri-handler.component'; /* ** */
import { PermissionRequestComponent } from '../../components/permission-request/permission-request.component'; /* ** */
import { SettingsComponent } from '../../components/settings/settings.component';
import { QrScannerComponent } from '../../components/modal/qr-scanner/qr-scanner.component';
// import { EmbeddedComponent } from '../../components/embedded/embedded.component';
// import { SigninComponent } from '../../components/embedded/signin/signin.component';
import { SignExprComponent } from '../../components/modal/sign-expr/sign-expr.component'; /* ** */
// import { CardComponent } from '../../components/embedded/card/card.component';
// import { SendButtonComponent } from '../../components/send/button/send-button.component';
import { ConfirmSendComponent } from '../../components/modal/send/confirm/send-confirmation.component';/* ** */
import { PrepareSendComponent } from '../../components/modal/send/prepare/prepare-send.component';/* ** */
// import { TokenDetail } from '../../components/modal/send/detail/token-detail.component';
import { OriginateComponent } from '../../components/modal/originate/originate.component';
// import { AlertComponent } from '../../components/modal/alert/alert.component';
// import { SpinnerLegacyComponent } from '../../components/spinner/legacy/spinner-legacy.component';
// import { SpinnerNewComponent } from '../../components/spinner/new/spinner-new.component';
import { LoggedInComponent } from '../../components/logged-in/logged-in.component';
import { ConfirmSendTemplateComponent } from '../../components/send/confirm-send-template/confirm-send-template.component';/* ** */
import { LoggedInRoutingModule } from './logged-in-routing.module';

// // Pipes
// import { ErrorHandlingPipe } from '../../pipes/error-handling.pipe';
// import { DelegatorNamePipe } from '../../pipes/delegator-name.pipe';
// import { TruncatePipe } from '../../pipes/truncate.pipe';
// import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

// // AoT requires an exported function for factories
// export function HttpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }

@NgModule({
  declarations: [
    // AppComponent,

    // View components
    // NewWalletComponent,
    // StartComponent,
    SendComponent,
    ReceiveComponent,
    DelegatePageComponent,
    // MnemonicImportComponent,
    ActivateComponent,
    // MessagesComponent,
    LoggedInComponent,
    // ModalComponent,
    // HeaderComponent,
    // P404Component,
    // P500Component,
    // SendButtonComponent,
    // ConnectLedgerComponent,
    // FooterComponent,
    // AccountViewComponent,
    // ActivityComponent,
    // NftsComponent,
    // PendingComponent,
    // BalancesComponent,
    NewImplicitComponent,
    // SpinnerComponent,
    // AgreementComponent,
    // TermsOfUseComponent,
    // PrivacyPolicyComponent,
    // TorusComponent,
    UriHandlerComponent,
    PermissionRequestComponent,
    SettingsComponent,
    QrScannerComponent,
    // EmbeddedComponent,
    // SigninComponent,
    SignExprComponent,
    // CardComponent,
    // TokenDetail,
    OriginateComponent,
    // SpinnerLegacyComponent,
    // SpinnerNewComponent,

    // // Modals
    // ModalComponent,
    // AlertComponent,
    ConfirmSendComponent,
    PrepareSendComponent,
    ConfirmSendTemplateComponent,
    DelegateComponent,

    // // Pipes
    // ErrorHandlingPipe,
    // DelegatorNamePipe,
    // TruncatePipe,
    // TimeAgoPipe
  ],
  imports: [
    // BrowserAnimationsModule,
    // FormsModule,
    CommonModule,
    LoggedInRoutingModule,
    HttpClientModule,
    FormsModule,
    // TranslateModule.forRoot({
    //   loader: {
    //     provide: TranslateLoader,
    //     useFactory: HttpLoaderFactory,
    //     deps: [HttpClient]
    //   }
    // })  // lazy loading will need TranslateModule.forChild() in the lazy loaded modules
  ],
  providers: [
    // Services
    // MessageService,
    // WalletService,
    // ActivityService,
    // EncryptionService,
    // BalanceService,
    // ImportService,
    // TzrateService,
    // CoordinatorService,
    // OperationService,
    // ExportService,
    // DelegateService,
    // InputValidationService,
    // LedgerService,
    EstimateService,
    BeaconService,
    // TorusService,
    // EmbeddedAuthService,
    TokenBalancesService,
    // SubjectService,

    // // Pipes
    // ErrorHandlingPipe,
    // DelegatorNamePipe,
    // TruncatePipe,
    // TimeAgoPipe
  ],
  // bootstrap: [AppComponent]
})
export class LoggedInModule { }
