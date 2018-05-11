import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BroadcastComponent } from './components/broadcast/broadcast.component';
import { ImportComponent } from './components/import/import.component';
import { StartComponent } from './components/start/start.component';
import { NewWalletComponent } from './components/new-wallet/new-wallet.component';
import { ActivityComponent } from './components/activity/activity.component';
import { OverviewComponent } from './components/overview/overview.component';
import { BackupComponent } from './components/backup/backup.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SendComponent } from './components/send/send.component';
import { NewAccountComponent } from './components/new-account/new-account.component';
import { ReceiveComponent } from './components/receive/receive.component';
import { DelegateComponent } from './components/delegate/delegate.component';
import { AccountComponent } from './components/account/account.component';
import { IcoWalletComponent } from './components/ico-wallet/ico-wallet.component';
import { BakeryComponent } from './components/bakery/bakery.component';
import { SignComponent } from './components/sign/sign.component';

const routes: Routes = [
  { path: '', component: StartComponent },  // Content Centre position
  { path: 'new-wallet', component: NewWalletComponent },  // Content Centre position
  { path: 'import', component: ImportComponent },  // Content Centre position
  { path: 'broadcast', component: BroadcastComponent },  // Content Centre position
  { path: 'ico-wallet', component: IcoWalletComponent },
  { path: 'activity', component: ActivityComponent },
  { path: 'overview', component: OverviewComponent },
  { path: 'backup', component: BackupComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'send', component: SendComponent },
  { path: 'new-account', component: NewAccountComponent },
  { path: 'receive', component: ReceiveComponent },
  { path: 'delegate', component: DelegateComponent },
  { path: 'account', component: AccountComponent },
  { path: 'bakery', component: BakeryComponent },
  { path: 'sign', component: SignComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
