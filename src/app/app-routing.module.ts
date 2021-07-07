import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartComponent } from './components/start/start.component';
import { NewWalletComponent } from './components/start/login-types/new-wallet/new-wallet.component';
import { MnemonicImportComponent } from './components/start/login-types/mnemonic-import/mnemonic-import.component';
import { ActivateComponent } from './components/activate/activate.component';
import { ConnectLedgerComponent } from './components/start/login-types/connect-ledger/connect-ledger.component';
import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { AccountViewComponent } from './components/account-view/account-view.component';
import { PrivacyPolicyComponent } from './components/agreement/privacy-policy/privacy-policy.component';
import { TermsOfUseComponent } from './components/agreement/terms-of-use/terms-of-use.component';
import { TorusComponent } from './components/start/login-types/torus/torus.component';
import { SettingsComponent } from './components/settings/settings.component';
import { EmbeddedComponent } from './components/embedded/embedded.component';
import { DelegatePageComponent } from './components/delegate-page/delegate-page.component';
import { LoggedInComponent } from './components/logged-in/logged-in.component';

const routes: Routes = [
  {
    path: '', children: [
      { path: '', component: StartComponent },
      { path: 'new-wallet', component: NewWalletComponent },
      { path: 'import', component: MnemonicImportComponent },
      { path: 'connect-ledger', component: ConnectLedgerComponent },
      { path: 'direct-auth', component: TorusComponent },
      {
        path: '', component: LoggedInComponent,
        loadChildren: () => import(`./components/logged-in/logged-in.module`).then(
          module => module.LoggedInModule
        )
      },
      { path: 'account/:address', component: AccountViewComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
      { path: 'terms-of-use', component: TermsOfUseComponent },
      { path: 'serviceworker', component: TermsOfUseComponent },
      { path: 'embedded', component: EmbeddedComponent }
    ]
  },
  { path: '404', component: P404Component, data: { title: 'Page 404' } },
  { path: '500', component: P500Component, data: { title: 'Page 500' } },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
