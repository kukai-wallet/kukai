import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartComponent } from './components/views/start/start.component';
import { NewWalletComponent } from './components/views/start/login-types/new-wallet/new-wallet.component';
import { MnemonicImportComponent } from './components/views/start/login-types/mnemonic-import/mnemonic-import.component';
import { ConnectLedgerComponent } from './components/views/start/login-types/connect-ledger/connect-ledger.component';
import { P404Component } from './components/views/error/404.component';
import { P500Component } from './components/views/error/500.component';
import { PrivacyPolicyComponent } from './components/views/start/agreement/privacy-policy/privacy-policy.component';
import { TermsOfUseComponent } from './components/views/start/agreement/terms-of-use/terms-of-use.component';
import { EmbeddedComponent } from './components/views/embedded/embedded.component';
import { LoggedInComponent } from './components/views/logged-in/logged-in.component';
import { ActivateComponent } from './components/views/start/activate/activate.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: StartComponent },
      { path: 'new-wallet', component: NewWalletComponent },
      { path: 'import', component: MnemonicImportComponent },
      { path: 'connect-ledger', component: ConnectLedgerComponent },
      {
        path: 'account',
        component: LoggedInComponent,
        loadChildren: () => import(`./components/views/logged-in/logged-in.module`).then((module) => module.LoggedInModule)
      },
      { path: 'activate', component: ActivateComponent },
      { path: 'serviceworker', component: TermsOfUseComponent },
      { path: 'embedded', component: EmbeddedComponent }
    ]
  },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'terms-of-use', component: TermsOfUseComponent },
  { path: '404', component: P404Component, data: { title: 'Page 404' } },
  { path: '500', component: P500Component, data: { title: 'Page 500' } },
  { path: '**', redirectTo: '404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
