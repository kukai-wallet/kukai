import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OfflineSigningComponent } from './components/offline-signing/offline-signing.component';
import { ImportComponent } from './components/import/import.component';
import { StartComponent } from './components/start/start.component';
import { NewWalletComponent } from './components/new-wallet/new-wallet.component';
import { ActivityComponent } from './components/activity/activity.component';
import { OverviewComponent } from './components/overview/overview.component';
import { BackupComponent } from './components/backup/backup.component';
import { SendComponent } from './components/send/send.component';
import { NewAccountComponent } from './components/new-account/new-account.component';
import { ReceiveComponent } from './components/receive/receive.component';
import { DelegateComponent } from './components/delegate/delegate.component';
import { AccountComponent } from './components/account/account.component';
import { MnemonicImportComponent } from './components/mnemonic-import/mnemonic-import.component';
import { BakeryComponent } from './components/bakery/bakery.component';
import { ActivateComponent } from './components/activate/activate.component';
import { VotingComponent } from './components/voting/voting.component';
import { CommunityComponent } from './components/community/community.component';
import { BakersListComponent } from './components/bakers-list/bakers-list.component';

const routes: Routes = [
  { path: '', component: StartComponent },  // Content Centre position
  { path: 'new-wallet', component: NewWalletComponent },  // Content Centre position
  { path: 'import', component: ImportComponent },  // Content Centre position
  { path: 'offline-signing', component: OfflineSigningComponent },  // Content Centre position
  { path: 'mnemonic-import', component: MnemonicImportComponent },
  { path: 'activity', component: ActivityComponent },
  { path: 'overview', component: OverviewComponent },
  { path: 'backup', component: BackupComponent },
  { path: 'send', component: SendComponent },
  { path: 'new-account', component: NewAccountComponent },
  { path: 'receive', component: ReceiveComponent },
  { path: 'delegate', component: DelegateComponent },
  { path: 'account', component: AccountComponent },
  { path: 'bakery', component: BakeryComponent },
  { path: 'activate', component: ActivateComponent },
  { path: 'voting', component: VotingComponent },
  { path: 'community', component: CommunityComponent },
  { path: 'bakers-list', component: BakersListComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
