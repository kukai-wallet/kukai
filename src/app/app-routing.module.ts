import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ImportComponent } from './components/import/import.component';
import { StartComponent } from './components/start/start.component';
import { NewWalletComponent } from './components/new-wallet/new-wallet.component';
import { ActivityComponent } from './components/activity/activity.component';
import { OverviewComponent } from './components/overview/overview.component';
import { SendComponent } from './components/send/send.component';
import { NewAccountComponent } from './components/new-account/new-account.component';
import { ReceiveComponent } from './components/receive/receive.component';
import { DelegateComponent } from './components/delegate/delegate.component';
import { AccountComponent } from './components/account/account.component';
import { MnemonicImportComponent } from './components/mnemonic-import/mnemonic-import.component';
import { BakeryComponent } from './components/bakery/bakery.component';
import { ActivateComponent } from './components/activate/activate.component';
import { CommunityComponent } from './components/community/community.component';
import { ConnectLedgerComponent } from './components/connect-ledger/connect-ledger.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { AccountViewComponent } from './components/account-view/account-view.component';

const routes: Routes = [
  { path: '', component: StartComponent },  // Content Centre position
  { path: 'new-wallet', component: NewWalletComponent },  // Content Centre position
  { path: 'import', component: ImportComponent },  // Content Centre position
  { path: 'mnemonic-import', component: MnemonicImportComponent },
  { path: 'activity', component: ActivityComponent },
  { path: 'overview', component: OverviewComponent },
  { path: 'send', component: SendComponent },
  { path: 'new-account', component: NewAccountComponent },
  { path: 'receive', component: ReceiveComponent },
  { path: 'delegate', component: DelegateComponent },
  { path: 'account-legacy', component: AccountComponent },
  { path: 'bakery', component: BakeryComponent },
  { path: 'activate', component: ActivateComponent },
  { path: 'community', component: CommunityComponent },
  { path: 'connect-ledger', component: ConnectLedgerComponent },
  { path: 'accounts', component: AccountsComponent },
  { path: 'account/:address', component: AccountViewComponent },
  {
    path: '404',
    component: P404Component,
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    component: P500Component,
    data: {
      title: 'Page 500'
    }
  },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
