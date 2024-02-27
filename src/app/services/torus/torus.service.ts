import { Injectable } from '@angular/core';
import DirectWebSdk from 'customauth';
import NodeDetailManager from '@toruslabs/fetch-node-details';
import { TORUS_LEGACY_NETWORK } from '@toruslabs/constants';
import TorusUtils from '@toruslabs/torus.js';
import { OperationService } from '../../services/operation/operation.service';
import { InputValidationService } from '../../services/input-validation/input-validation.service';
import { CONSTANTS } from '../../../environments/environment';
import { MessageService } from '../message/message.service';

const GOOGLE = 'google';
const REDDIT = 'reddit';
const TWITTER = 'twitter';
const FACEBOOK = 'facebook';
const EMAIL = 'email';
const AUTH_DOMAIN = 'https://dev-0li4gssz.eu.auth0.com';
const AUTH_DOMAIN_MAINNET = 'https://kukai.eu.auth0.com';
@Injectable({
  providedIn: 'root'
})
export class TorusService {
  readonly web3AuthClientId = CONSTANTS.MAINNET
    ? 'BBQoFIabI50S1-0QsGHGTM4qID_FDjja0ZxIxKPyFqc0El--M-EG0c2giaBYVTVVE6RC9WCUzCJyW24aJrR_Lzc'
    : 'BBHmFdLXgGDzSiizRVMWtyL_7Dsoxu5B8zep2Pns8sGELslgXDbktJewVDVDDBlknEKkMCtzISLjJtxk60SK2-g';
  torus: any = undefined;
  nodeDetails: { torusNodeEndpoints: string[]; torusNodePub: any[] } = null;
  public readonly verifierMap: any;
  private readonly proxy: any;
  verifierMaps = {
    testnet: {
      [GOOGLE]: {
        name: 'Google',
        typeOfLogin: 'google',
        clientId: '952872982551-od475jfe3ach7dghacin634rbkcqhpll.apps.googleusercontent.com',
        verifier: 'kukai-google',
        subVerifier: 'web-kukai',
        caseSensitiveVerifierID: false,
        lookups: true,
        aggregated: true
      },
      [REDDIT]: {
        name: 'Reddit',
        typeOfLogin: 'jwt',
        clientId: '7xLcBa3xd4VTmlGbClU3qXeBZGta3OvM',
        verifier: 'tezos-reddit-testnet',
        subVerifier: 'web-kukai',
        caseSensitiveVerifierID: false,
        lookups: true,
        aggregated: true
      },
      [TWITTER]: {
        name: 'Twitter',
        typeOfLogin: 'twitter',
        clientId: 'vKFgnaYZzKLUnhxnX5xqTqeMcumdVTz1',
        verifier: 'tezos-twitter-test',
        caseSensitiveVerifierID: false,
        lookups: true
      },
      [FACEBOOK]: {
        name: 'Facebook',
        typeOfLogin: 'facebook',
        clientId: '213778980232619',
        verifier: 'tezos-facebook-testnet',
        caseSensitiveVerifierID: false
      },
      [EMAIL]: {
        name: 'Email',
        typeOfLogin: 'jwt',
        clientId: 'L98HOmUY0hxLGX9k8AHEZxb1dj9Y3uZw',
        verifier: 'kukai-google',
        subVerifier: 'web-kukai-email',
        caseSensitiveVerifierID: false,
        lookups: true,
        aggregated: true
      }
    },
    mainnet: {
      [GOOGLE]: {
        name: 'Google',
        typeOfLogin: 'google',
        clientId: '952872982551-49mfvktoios59oj2kmiknlltfq9pvi6c.apps.googleusercontent.com',
        verifier: 'tezos-google',
        subVerifier: 'kukai-web',
        caseSensitiveVerifierID: false,
        lookups: true,
        aggregated: true
      },
      [REDDIT]: {
        name: 'Reddit',
        typeOfLogin: 'jwt',
        clientId: 'zyQ9tnKfdg3VNyj6MGhZq4dHbBzbmEvl',
        verifier: 'tezos-reddit',
        subVerifier: 'web-kukai',
        caseSensitiveVerifierID: false,
        lookups: true,
        aggregated: true
      },
      [TWITTER]: {
        name: 'Twitter',
        typeOfLogin: 'twitter',
        clientId: '3aCoxh3pw8g8JeFsdlJNUGwdgtLwdwgE',
        verifier: 'tezos-twitter',
        caseSensitiveVerifierID: false,
        lookups: true
      },
      [FACEBOOK]: {
        name: 'Facebook',
        typeOfLogin: 'facebook',
        clientId: '523634882377310',
        verifier: 'tezos-facebook',
        caseSensitiveVerifierID: false
      },
      [EMAIL]: {
        name: 'Email',
        typeOfLogin: 'jwt',
        clientId: 'LTg6fVsacafGmhv14TZlrWF1EavwQoDZ',
        verifier: 'tezos-google',
        subVerifier: 'web-kukai-email',
        caseSensitiveVerifierID: false,
        lookups: true,
        aggregated: true
      }
    }
  };
  verifierMapKeys: any;
  constructor(private operationService: OperationService, private inputValidationService: InputValidationService, private messageService: MessageService) {
    if (CONSTANTS.MAINNET) {
      this.verifierMap = this.verifierMaps.mainnet;
      this.proxy = {
        network: TORUS_LEGACY_NETWORK.MAINNET
      };
    } else {
      this.verifierMap = this.verifierMaps.testnet;
      this.proxy = {
        network: TORUS_LEGACY_NETWORK.TESTNET
      };
    }
    this.verifierMapKeys = Object.keys(this.verifierMap);
  }
  private async isBraveOrChrome(): Promise<boolean> {
    return (await (<any>navigator)?.brave?.isBrave()) || navigator.userAgent.includes('Chrome') || false;
  }
  async initTorus() {
    if (this.torus === undefined) {
      this.torus = null;
      try {
        // set this value to false in every browser except for brave
        const redirectToOpener = await this.isBraveOrChrome();
        const torusdirectsdk = new DirectWebSdk({
          web3AuthClientId: this.web3AuthClientId,
          baseUrl: `${location.origin}/serviceworker`,
          redirectToOpener,
          enableLogging: !(this.proxy.network === 'mainnet'),
          network: this.proxy.network
        });
        await torusdirectsdk.init({ skipSw: false });
        this.torus = torusdirectsdk;
      } catch (error) {
        this.torus = undefined;
        console.error(error, 'oninit caught');
      }
    }
  }
  async lookupPkh(selectedVerifier: string, verifierId: string): Promise<any> {
    const fetchNodeDetails = new NodeDetailManager({
      network: this.proxy.network
    });
    const torus = new TorusUtils({ clientId: this.web3AuthClientId, network: this.proxy.network });
    let sanitizedVerifierId = verifierId;
    if (!this.verifierMap[selectedVerifier].caseSensitiveVerifierID && selectedVerifier !== 'twitter') {
      sanitizedVerifierId = sanitizedVerifierId.toLocaleLowerCase();
    }
    let twitterId = '';
    if (selectedVerifier === 'twitter') {
      const username = sanitizedVerifierId.replace('@', '');
      const { id } = await this.twitterLookup(username);
      if (this.inputValidationService.twitterId(id)) {
        sanitizedVerifierId = `twitter|${id}`;
        twitterId = id;
      } else {
        throw new Error('Twitter handle not found');
      }
    }
    const verifier = this.verifierMap[selectedVerifier].verifier;
    if (!this.nodeDetails) {
      const { torusNodeEndpoints, torusNodePub, torusIndexes } = await fetchNodeDetails.getNodeDetails({ verifier, verifierId: sanitizedVerifierId });
      this.nodeDetails = { torusNodeEndpoints, torusNodePub }; // Cache node details
    }
    const { finalKeyData }: any = await torus.getPublicAddress(this.nodeDetails.torusNodeEndpoints, this.nodeDetails.torusNodePub, {
      verifier,
      verifierId: sanitizedVerifierId
    });
    const pkh = this.operationService.spPointsToPkh(finalKeyData?.X, finalKeyData?.Y);
    return { pkh, twitterId };
  }
  async twitterLookup(username?: string, id?: string) {
    let req = {};
    if ((id && username) || (!id && !username)) {
      console.log({ username, id });
      throw new Error('Invalid input');
    } else if (id) {
      req = { id };
    } else {
      req = { username: username.replace('@', '') };
    }
    return await fetch(`https://backend.kukai.network/twitter-lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(req)
    }).then((ans) => {
      return ans.json();
    });
  }
  async loginTorus(selectedVerifier: string, verifierId = '', skipTorusKey = 0, checkIfNewKey = false): Promise<any> {
    if (!CONSTANTS.MAINNET && document?.location?.host === 'localhost:4200' && !['google', 'twitter', 'email'].includes(selectedVerifier)) {
      return this.mockLogin(selectedVerifier); // mock locally
    }
    try {
      const jwtParams: any = this._loginToConnectionMap()[selectedVerifier] || {};
      if (verifierId && selectedVerifier === GOOGLE) {
        jwtParams.login_hint = verifierId;
        console.log('login_hint: ' + verifierId);
      }
      if (verifierId && selectedVerifier === EMAIL) {
        jwtParams.login_hint = verifierId;
      }
      const { typeOfLogin, clientId, verifier, aggregated } = this.verifierMap[selectedVerifier];
      const loginDetails = aggregated
        ? await this.torus.triggerAggregateLogin({
            login_hint: verifierId,
            aggregateVerifierType: 'single_id_verifier',
            verifierIdentifier: verifier,
            subVerifierDetailsArray: [
              {
                clientId,
                typeOfLogin: typeOfLogin,
                verifier: this.verifierMap[selectedVerifier].subVerifier,
                jwtParams
              }
            ],
            skipTorusKey,
            checkIfNewKey
          })
        : await this.torus.triggerLogin({
            verifier,
            typeOfLogin,
            clientId,
            jwtParams,
            skipTorusKey,
            checkIfNewKey
          });
      if (aggregated) {
        loginDetails.userInfo = loginDetails.userInfo[0];
      }
      if (selectedVerifier === FACEBOOK) {
        console.log('Invalidating access token...');
        fetch(`https://graph.facebook.com/me/permissions?access_token=${loginDetails.userInfo.accessToken}`, { method: 'DELETE', mode: 'cors' });
      }
      const keyPair =
        skipTorusKey && !loginDetails?.finalKeyData?.privKey
          ? { pk: '', pkh: '' }
          : this.operationService.spPrivKeyToKeyPair(loginDetails.finalKeyData.privKey);
      console.log('DirectAuth KeyPair', keyPair);
      if (loginDetails?.existingPk) {
        loginDetails.userInfo.preexistingPkh = this.operationService.spPointsToPkh(loginDetails.existingPk.X, loginDetails.existingPk.Y);
        loginDetails.userInfo.isNewKey = !loginDetails?.existingPk;
      }
      if (loginDetails?.userInfo?.typeOfLogin === 'jwt') {
        loginDetails.userInfo.typeOfLogin = selectedVerifier;
      }
      console.log('DirectAuth UserInfo', loginDetails.userInfo);
      return { keyPair, userInfo: loginDetails.userInfo };
    } catch (e) {
      console.error(e, 'login caught');
      if (typeof e?.message === 'string') {
        this.messageService.addError(e.message, 0);
      }
      return { keyPair: null, userInfo: null };
    }
  }
  async getTorusKeyPair(selectedVerifier: string, verifierId: string): Promise<any> {
    const { keyPair } = await this.loginTorus(selectedVerifier, verifierId);
    return keyPair;
  }
  _loginToConnectionMap = () => {
    return {
      [TWITTER]: {
        domain: CONSTANTS.MAINNET ? AUTH_DOMAIN_MAINNET : AUTH_DOMAIN
      },
      [FACEBOOK]: {
        scope: 'public_profile email'
      },
      [REDDIT]: {
        domain: CONSTANTS.MAINNET ? AUTH_DOMAIN_MAINNET : AUTH_DOMAIN,
        connection: 'Reddit',
        verifierIdField: 'name',
        isVerifierIdCaseSensitive: false
      },
      [EMAIL]: {
        domain: CONSTANTS.MAINNET ? AUTH_DOMAIN_MAINNET : AUTH_DOMAIN,
        connection: '',
        verifierIdField: 'name',
        isVerifierCaseSensitive: false
      }
    };
  };
  private async mockLogin(typeOfLogin: string): Promise<any> {
    const keyPair = {
      sk: 'spsk1VfCfhixtzGvUSKDre6jwyGbXFm6aoeLGnxeVLCouueZmkgtJF',
      pk: 'sppk7cZsZeBApsFgYEdWuSwj92YCWkJxMmBfkN3FeKRmEB7Lk5pmDrT',
      pkh: 'tz2WKg52VqnYXH52TZbSVjT4hcc8YGVKi7Pd'
    };
    const userInfo = {
      typeOfLogin,
      verifierId: typeOfLogin !== 'google' ? 'MockUser' : 'mock@user.com',
      name: typeOfLogin !== 'twitter' ? 'Mock User' : '@MockUser'
    };
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ keyPair, userInfo });
      }, 1000);
    });
  }
}
