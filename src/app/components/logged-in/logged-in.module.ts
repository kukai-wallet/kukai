import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { EstimateService } from '../../services/estimate/estimate.service';
import { SendComponent } from '../../components/send/send.component';
import { ReceiveComponent } from '../../components/modal/receive/receive.component';
import { DelegateComponent } from '../../components/modal/delegate/delegate.component';
import { DelegatePageComponent } from '../../components/delegate-page/delegate-page.component';
import { ActivateComponent } from '../../components/activate/activate.component';
import { NewImplicitComponent } from '../../components/modal/new-implicit/new-implicit.component';
import { UriHandlerComponent } from '../../components/uri-handler/uri-handler.component';
import { PermissionRequestComponent } from '../../components/permission-request/permission-request.component';
import { SettingsComponent } from '../../components/settings/settings.component';
import { QrScannerComponent } from '../../components/modal/qr-scanner/qr-scanner.component';
import { SignExprComponent } from '../../components/modal/sign-expr/sign-expr.component';
import { ConfirmSendComponent } from '../../components/modal/send/confirm/send-confirmation.component';
import { PrepareSendComponent } from '../../components/modal/send/prepare/prepare-send.component';
import { OriginateComponent } from '../../components/modal/originate/originate.component';
import { LoggedInComponent } from '../../components/logged-in/logged-in.component';
import { ConfirmSendTemplateComponent } from '../../components/send/confirm-send-template/confirm-send-template.component';
import { LoggedInRoutingModule } from './logged-in-routing.module';
import { AdvancedToggleComponent } from '../ui/toggle/advanced/advanced.component';

@NgModule({
  declarations: [
    SendComponent,
    ReceiveComponent,
    DelegatePageComponent,
    ActivateComponent,
    LoggedInComponent,
    NewImplicitComponent,
    UriHandlerComponent,
    PermissionRequestComponent,
    SettingsComponent,
    QrScannerComponent,
    SignExprComponent,
    OriginateComponent,
    ConfirmSendComponent,
    PrepareSendComponent,
    ConfirmSendTemplateComponent,
    DelegateComponent,
    AdvancedToggleComponent
  ],
  imports: [
    CommonModule,
    LoggedInRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  exports: [
    AdvancedToggleComponent
  ],
  providers: [
    EstimateService
  ]
})
export class LoggedInModule { }
