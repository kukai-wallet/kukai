import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { NewWalletComponent } from './new-wallet/new-wallet.component';


@NgModule({
  declarations: [
    AppComponent,
    NewWalletComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
