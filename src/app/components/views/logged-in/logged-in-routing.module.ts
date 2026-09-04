import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountViewComponent } from './account-view/account-view.component';
import { SettingsComponent } from './settings/settings.component';
import { DelegatePageComponent } from './delegate-page/delegate-page.component';
import { ActivateComponent } from '../start/activate/activate.component';
import { CONSTANTS } from '../../../../environments/environment';

const routes: Routes = [
  { path: ':address', component: AccountViewComponent },
  { path: ':address/settings', component: SettingsComponent },
  // Delegation and staking are not supported on Tezos X: the page is not routed there, so the URL falls through to 404
  ...(CONSTANTS.TEZOS_X ? [] : [{ path: ':address/stakers', component: DelegatePageComponent }]),
  { path: 'activate', component: ActivateComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoggedInRoutingModule {}
