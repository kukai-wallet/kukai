import { Injectable } from '@angular/core';
import DirectWebSdk from '@toruslabs/torus-direct-web-sdk';
import FetchNodeDetails from '@toruslabs/fetch-node-details';
import TorusUtils from '@toruslabs/torus.js';
import { OperationService } from '../../services/operation/operation.service';
import { InputValidationService } from '../../services/input-validation/input-validation.service';

const GOOGLE = 'google';
const REDDIT = 'reddit';
const TWITTER = 'twitter';
const proxyAddress = '0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183';

const AUTH_DOMAIN = 'https://dev-0li4gssz.eu.auth0.com';
@Injectable({
  providedIn: 'root'
})
export class TorusService {
  torus: any = null;
  nodeDetails: { torusNodeEndpoints: String[], torusNodePub: any[] } = null;
  public readonly verifierMap = {
    [GOOGLE]: {
      name: 'Google',
      typeOfLogin: 'google',
      clientId: '952872982551-od475jfe3ach7dghacin634rbkcqhpll.apps.googleusercontent.com',
      verifier: 'kukai-google',
      caseSensitiveVerifierID: false
    },
    [REDDIT]: {
      name: 'Reddit',
      typeOfLogin: 'reddit',
      clientId: 'H0nhRv1leU9pGQ',
      verifier: 'tezos-reddit-testnet',
      caseSensitiveVerifierID: false
    },
    [TWITTER]: {
      name: 'Twitter',
      typeOfLogin: 'twitter',
      clientId: 'vKFgnaYZzKLUnhxnX5xqTqeMcumdVTz1',
      verifier: 'tezos-twitter-test',
      caseSensitiveVerifierID: false
    }
  };
  verifierMapKeys = Object.keys(this.verifierMap);
  constructor(
    private operationService: OperationService,
    private inputValidationService: InputValidationService
  ) {
  }
  async initTorus() {
    if (!this.torus) {
      try {
        const torusdirectsdk = new DirectWebSdk({
          baseUrl: `${location.origin}/serviceworker`,
          enableLogging: true,
          proxyContractAddress: proxyAddress,
          network: 'testnet',
        });
        console.log('init Torus');
        await torusdirectsdk.init({ skipSw: false });
        this.torus = torusdirectsdk;
      } catch (error) {
        console.error(error, 'oninit caught');
      }
    }
  }
  async lookupPkh(selectedVerifier: string, verifierId: string): Promise<any> {
    const fetchNodeDetails = new FetchNodeDetails({ network: 'ropsten', proxyAddress: proxyAddress });
    const torus = new TorusUtils();
    const verifier = this.verifierMap[selectedVerifier].verifier;
    if (!this.nodeDetails) {
      console.log('Get node details ');
      const { torusNodeEndpoints, torusNodePub, torusIndexes } = await fetchNodeDetails.getNodeDetails();
      this.nodeDetails = { torusNodeEndpoints, torusNodePub }; // Cache node details
    }
    let sanitizedVerifierId = verifierId;
    if (!this.verifierMap[selectedVerifier].caseSensitiveVerifierID) {
      sanitizedVerifierId = sanitizedVerifierId.toLocaleLowerCase();
    }
    let twitterId = '';
    if (selectedVerifier === 'twitter') {
      console.log('twitter <>');
      const username = sanitizedVerifierId.replace('@', '');
      const { id } = await this.twitterLookup(username);
      if (this.inputValidationService.twitterId(id)) {
        sanitizedVerifierId = `twitter|${id}`;
        twitterId = id;
      } else {
        throw new Error('Twitter handle not found');
      }
    }
    // twitter|1000319947724255232
    const pk: any = await torus.getPublicAddress(this.nodeDetails.torusNodeEndpoints, this.nodeDetails.torusNodePub, { verifier, verifierId: sanitizedVerifierId }, true);
    const pkh = this.operationService.spPointsToPkh(pk.X, pk.Y);
    console.log(pkh);
    return { pkh, twitterId };
  }
  async twitterLookup(username?: string, id?: string) {
    let req = {};
    if ((id && username) || (!id && !username)) {
      console.log({username, id});
      throw new Error('Invalid input');
    } else if (id) {
      req = { id };
    } else {
      req = { username: username.replace('@', '') };
    }
    return await fetch(`https://api.tezos.help/twitter-lookup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(req)
    }).then(
      (ans) => {
        return ans.json();
      }
    );
  }
  async loginTorus(selectedVerifier: string, verifierId = ''): Promise<any> {
    try {
      const jwtParams: any = this._loginToConnectionMap()[selectedVerifier] || {};
      if (verifierId && selectedVerifier === GOOGLE) {
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
      const keyPair = this.operationService.spPrivKeyToKeyPair(loginDetails.privateKey);
      console.log('Torus details', { keyPair, userInfo: loginDetails.userInfo });
      return { keyPair, userInfo: loginDetails.userInfo };
    } catch (e) {
      console.error(e, 'login caught');
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
        domain: AUTH_DOMAIN,
      }
    };
  }
}
