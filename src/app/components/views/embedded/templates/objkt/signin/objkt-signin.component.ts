import { Component, EventEmitter, Output } from '@angular/core';
import { EmbedLoginChoices } from '../../../../../../libraries/enums';

const LOGIN_OPTIONS = [
  { torusKey: 'google', imgPath: 'torus-login/google-color.svg', title: 'Log in with Google' },
  { torusKey: 'twitter', imgPath: 'torus-login/x-color.svg', title: 'Log in with X / Twitter' },
  { torusKey: EmbedLoginChoices.Other, imgPath: 'tezos-xtz-logo.svg', title: 'Log in with Tezos wallets' }
];

@Component({
  selector: 'app-objkt-signin',
  templateUrl: './objkt-signin.component.html',
  styleUrl: './objkt-signin.component.scss'
})
export class ObjktSigninComponent {
  @Output() login = new EventEmitter<string>();
  @Output() abort = new EventEmitter();
  loginOptions = LOGIN_OPTIONS;
}
