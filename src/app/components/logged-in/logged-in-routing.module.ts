import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountViewComponent } from '../account-view/account-view.component';
import { SettingsComponent } from '../settings/settings.component';
import { DelegatePageComponent } from '../delegate-page/delegate-page.component';
import { ActivateComponent } from '../activate/activate.component';

const routes: Routes = [
    { path: ':address', component: AccountViewComponent },
    { path: ':address/settings', component: SettingsComponent },
    { path: ':address/stakers', component: DelegatePageComponent },
    { path: 'activate', component: ActivateComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class LoggedInRoutingModule { }