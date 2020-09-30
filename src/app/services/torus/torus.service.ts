import { Injectable } from '@angular/core';
import DirectWebSdk from '@toruslabs/torus-direct-web-sdk';
import FetchNodeDetails from '@toruslabs/fetch-node-details';
import { post } from '@toruslabs/http-helpers';
import TorusUtils from '@toruslabs/torus.js';
import { OperationService } from '../../services/operation/operation.service';
import { MessageService } from '../message/message.service';

const GOOGLE = 'google';
const REDDIT = 'reddit';
const GITHUB = 'github';
const TWITTER = 'twitter';

const AUTH_DOMAIN = 'https://torus-test.auth0.com';
@Injectable({
  providedIn: 'root'
})

export class TorusService {
  torus: any = null;
  nodeDetails: { torusNodeEndpoints: String[], torusNodePub: any[]} = null;
  public readonly verifierMap = {
    [GOOGLE]: {
      name: 'Google',
      typeOfLogin: 'google',
      clientId: '952872982551-od475jfe3ach7dghacin634rbkcqhpll.apps.googleusercontent.com',
      verifier: 'kukai-google',
    },
    [REDDIT]: {
      name: 'Reddit',
      typeOfLogin: 'reddit',
      clientId: 'H0nhRv1leU9pGQ',
      verifier: 'tezos-reddit-testnet' },
    /*
    [FACEBOOK]: { name: 'Facebook', typeOfLogin: 'facebook', clientId: '617201755556395', verifier: 'facebook-lrc' },
    [GITHUB]: { name: 'Github', typeOfLogin: 'github', clientId: 'PC2a4tfNRvXbT48t89J5am0oFM21Nxff', verifier: 'torus-auth0-github-lrc' },
    [TWITTER]: { name: 'Twitter', typeOfLogin: 'twitter', clientId: 'A7H8kkcmyFRlusJQ9dZiqBLraG2yWIsO', verifier: 'torus-auth0-twitter-lrc' }*/
  };
  verifierMapKeys = Object.keys(this.verifierMap);
  constructor(
    private operationService: OperationService,
    private messageService: MessageService
  ) {
  }
  async initTorus() {
    if (!this.torus) {
      try {
        const torusdirectsdk = new DirectWebSdk({
          baseUrl: `${location.origin}/serviceworker`,
          enableLogging: true,
          proxyContractAddress: '0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183',
          network: 'testnet',
        });
        console.log('init Torus');
        await torusdirectsdk.init({ skipSw: false });
        console.log('done Torus');
        this.torus = torusdirectsdk;
      } catch (error) {
        console.error(error, 'oninit caught');
      }
    }
  }
  async lookupPkh(selectedVerifier: string, verifierId: string): Promise<string> {
    const fetchNodeDetails = new FetchNodeDetails({ network: 'ropsten', proxyAddress: '0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183' });
    const torus = new TorusUtils();
    const verifier = this.verifierMap[selectedVerifier].verifier;
    if (!this.nodeDetails) {
      console.log('Get node details');
      const { torusNodeEndpoints, torusNodePub, torusIndexes } = await fetchNodeDetails.getNodeDetails();
      this.nodeDetails = { torusNodeEndpoints, torusNodePub }; // Cache node details
    }
    const pk: any = await torus.getPublicAddress(this.nodeDetails.torusNodeEndpoints, this.nodeDetails.torusNodePub, { verifier, verifierId: verifierId.toLowerCase() }, true);
    const pkh = this.operationService.spPointsToPkh(pk.X, pk.Y);
    console.log(pkh);
    this.operationService.torusKeyLookup(pkh).subscribe((ans) => {
      console.log('ans', ans);
    });
    return pkh;
  }
  async loginTorus(selectedVerifier: string, verifierId = ''): Promise<any> {
    try {
      const jwtParams = this._loginToConnectionMap()[selectedVerifier] || {};
      if (verifierId) {
        jwtParams.login_hint = verifierId;
        console.log('login_hint: ' + verifierId);
      }
      const { typeOfLogin, clientId, verifier } = this.verifierMap[selectedVerifier];
      const loginDetails = await this.torus.triggerLogin({
        verifier,
        typeOfLogin,
        clientId,
        jwtParams
      });
      console.log(loginDetails);
      const keyPair = this.operationService.spPrivKeyToKeyPair(loginDetails.privateKey);
      console.log(keyPair);
      console.log('get pub');
      return { keyPair, userInfo: loginDetails.userInfo };
    } catch (e) {
      console.error(e, 'login caught');
      return { keyPair: null, userInfo: null};
    }
  }
  async getTorusKeyPair(selectedVerifier: string, verifierId: string): Promise<any> {
    const { keyPair } = await this.loginTorus(selectedVerifier, verifierId);
    return keyPair;
  }
  _loginToConnectionMap = () => {
    return {
      [GITHUB]: { domain: AUTH_DOMAIN },
      [TWITTER]: { domain: AUTH_DOMAIN }
    };
  }
}
