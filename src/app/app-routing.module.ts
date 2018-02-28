import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BroadcastComponent } from './components/broadcast/broadcast.component';
import { ImportComponent } from './components/import/import.component';
import { StartComponent } from './components/start/start.component';
import { NewWalletComponent } from './components/new-wallet/new-wallet.component';
import { ActivityComponent } from './components/activity/activity.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { BackupComponent } from './components/backup/backup.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SendComponent } from './components/send/send.component';

const routes: Routes = [
  { path: '', component: StartComponent },
  { path: 'new-wallet', component: NewWalletComponent },
  { path: 'import', component: ImportComponent },
  { path: 'broadcast', component: BroadcastComponent },
  { path: 'activity', component: ActivityComponent },
  { path: 'accounts', component: AccountsComponent },
  { path: 'backup', component: BackupComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'send', component: SendComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
