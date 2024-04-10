import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { EstimateService } from '../../../services/estimate/estimate.service';
import { SendComponent } from '../../misc/send/send.component';
import { ReceiveComponent } from '../../modals/receive/receive.component';
import { DelegateComponent } from '../../modals/delegate/delegate.component';
import { OperationsComponent } from '../../modals/operations/operations.component';
import { OperationsDisplayComponent } from '../../modals/operations/operations-display/operations-display.component';
import { FeeDisplayComponent } from '../../modals/operations/fee-display/fee-display.component';
import { CustomFeeComponent } from '../../modals/operations/fee-display/custom-fee/custom-fee.component';
import { SignComponent } from '../../modals/operations/sign/sign.component';
import { DelegatePageComponent } from './delegate-page/delegate-page.component';
import { ActivateComponent } from '../start/activate/activate.component';
import { NewImplicitComponent } from '../../modals/new-implicit/new-implicit.component';
import { UriHandlerComponent } from '../../misc/uri-handler/uri-handler.component';
import { PermissionRequestComponent } from '../../modals/permission-request/permission-request.component';
import { PermissionRequestDropdownComponent } from '../../ui/dropdown/permission-request/permission-request.component';
import { SettingsComponent } from './settings/settings.component';
import { QrScannerComponent } from '../../modals/qr-scanner/qr-scanner.component';
import { SignExprComponent } from '../../modals/sign-expr/sign-expr.component';
import { ConfirmSendComponent } from '../../modals/send/confirm/send-confirmation.component';
import { PrepareSendComponent } from '../../modals/send/prepare/prepare-send.component';
import { LoggedInComponent } from './logged-in.component';
import { LoggedInRoutingModule } from './logged-in-routing.module';
import { ConfirmSendEmbedComponent } from '../embedded/confirm-send/confirm-send.component';
import { SignExprEmbedComponent } from '../embedded/sign-expr/sign-expr.component';
import { AdvancedToggleComponent } from '../../ui/button/toggle/advanced/advanced.component';
import { PrepareSendDropdownComponent } from '../../ui/dropdown/prepare-send/prepare-send-dropdown.component';
import { AssetComponent } from '../../ui/asset/asset.component';
import { NftsBodyComponent } from './account-view/nfts/body/body.component';
import { NftsTokenComponent } from './account-view/nfts/token/token.component';
import { AccountListComponent } from '../../modals/account-list/list.component';
import { AccountListBodyComponent } from '../../modals/account-list/body/body.component';
import { ListComponent } from '../../ui/generic/list.component';
import { SearchBarComponent } from '../../ui/search/search.component';
import { RemoveCommaPipe } from '../../../pipes/remove-comma.pipe';
import { ExprTemplateComponent } from '../embedded/sign-expr/template/template.component';
import { QueueEmbedComponent } from '../embedded/queue/queue.component';
import { SwapLiquidityComponent } from '../../modals/swap-liquidity/swap-liquidity.component';
import { SwapLiquidityService } from '../../../services/swap-liquidity/swap-liquidity.service';
import { InfoComponent } from '../../modals/info/info.component';
import { ExportMnemonicComponent } from '../../modals/export-mnemonic/export-mnemonic.component';
import { SwapLiquidityConfirmComponent } from '../../modals/swap-liquidity/swap-liquidity-confirm.component';
import { ChartComponent } from '../../ui/chart/chart.component';
import { ChartService } from '../../../../app/services/chart/chart.service';
import { BuyComponent } from './account-view/buy/buy.component';
import { BuyModalComponent } from '../../modals/buy/buy.component';
import { SessionSelectComponent } from '../../modals/session-select/session-select.component';
import { SessionSelectDropdownComponent } from '../../ui/dropdown/session-select/session-select.component';

@NgModule({
  declarations: [
    SendComponent,
    ReceiveComponent,
    DelegatePageComponent,
    SwapLiquidityComponent,
    ActivateComponent,
    LoggedInComponent,
    NewImplicitComponent,
    UriHandlerComponent,
    PermissionRequestComponent,
    PermissionRequestDropdownComponent,
    SettingsComponent,
    QrScannerComponent,
    SignExprComponent,
    ConfirmSendComponent,
    PrepareSendComponent,
    DelegateComponent,
    OperationsComponent,
    OperationsDisplayComponent,
    FeeDisplayComponent,
    CustomFeeComponent,
    SignComponent,
    AdvancedToggleComponent,
    ConfirmSendEmbedComponent,
    SignExprEmbedComponent,
    QueueEmbedComponent,
    PrepareSendDropdownComponent,
    AssetComponent,
    NftsBodyComponent,
    NftsTokenComponent,
    AccountListComponent,
    AccountListBodyComponent,
    ListComponent,
    SearchBarComponent,
    RemoveCommaPipe,
    ExprTemplateComponent,
    SwapLiquidityConfirmComponent,
    InfoComponent,
    RemoveCommaPipe,
    ExportMnemonicComponent,
    ChartComponent,
    BuyComponent,
    BuyModalComponent,
    SessionSelectComponent,
    SessionSelectDropdownComponent
  ],
  imports: [CommonModule, LoggedInRoutingModule, HttpClientModule, FormsModule],
  exports: [
    BuyComponent,
    BuyModalComponent,
    AdvancedToggleComponent,
    SendComponent,
    ConfirmSendEmbedComponent,
    SignExprEmbedComponent,
    QueueEmbedComponent,
    AssetComponent,
    NftsBodyComponent,
    NftsTokenComponent,
    PermissionRequestComponent,
    PermissionRequestDropdownComponent,
    SessionSelectComponent,
    SessionSelectDropdownComponent,
    ListComponent,
    AccountListComponent,
    AccountListBodyComponent,
    SearchBarComponent,
    RemoveCommaPipe,
    ExprTemplateComponent,
    InfoComponent,
    ChartComponent
  ],
  providers: [SwapLiquidityService, ChartService, EstimateService, RemoveCommaPipe]
})
export class LoggedInModule {}
