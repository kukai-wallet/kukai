import { Injectable } from '@angular/core';
import DirectWebSdk from '@toruslabs/customauth';
import FetchNodeDetails from '@toruslabs/fetch-node-details';
import TorusUtils from '@toruslabs/torus.js';
import { OperationService } from '../../services/operation/operation.service';
import { InputValidationService } from '../../services/input-validation/input-validation.service';
import { CONSTANTS } from '../../../environments/environment';

const GOOGLE = 'google';
const REDDIT = 'reddit';
const TWITTER = 'twitter';
const FACEBOOK = 'facebook';
const AUTH_DOMAIN = 'https://dev-0li4gssz.eu.auth0.com';
const AUTH_DOMAIN_MAINNET = 'https://kukai.eu.auth0.com';
@Injectable({
  providedIn: 'root'
})
export class TorusService {
  torus: any = null;
  nodeDetails: { torusNodeEndpoints: string[], torusNodePub: any[] } = null;
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
      }
    },
    mainnet: {
      [GOOGLE]: {
        name: 'Google',
        typeOfLogin: 'google',
        clientId: '952872982551-49mfvktoios59oj2kmiknlltfq9pvi6c.apps.googleusercontent.com',
        verifier: 'tezos-google',
        caseSensitiveVerifierID: false,
        lookups: true
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
        clientId: 'UJl5d4iHVgbrAaSlucXNf2F2uKlC0m25',
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
      }
    }
  };
  verifierMapKeys: any;
  constructor(
    private operationService: OperationService,
    private inputValidationService: InputValidationService
  ) {
    if (CONSTANTS.MAINNET) {
      this.verifierMap = this.verifierMaps.mainnet;
      this.proxy = { address: '0x638646503746d5456209e33a2ff5e3226d698bea', network: 'mainnet' };
    } else {
      this.verifierMap = this.verifierMaps.testnet;
      this.proxy = { address: '0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183', network: 'ropsten' };
    }
    this.verifierMapKeys = Object.keys(this.verifierMap);
  }
  async initTorus() {
    if (!this.torus) {
      try {
        const torusdirectsdk = new DirectWebSdk({
          baseUrl: `${location.origin}/serviceworker`,
          redirectToOpener: true,
          enableLogging: !(this.proxy.network === 'mainnet'),
          proxyContractAddress: this.proxy.address,
          network: (this.proxy.network === 'mainnet') ? this.proxy.network : 'testnet',
        });
        await torusdirectsdk.init({ skipSw: false });
        this.torus = torusdirectsdk;
      } catch (error) {
        console.error(error, 'oninit caught');
      }
    }
  }
  async lookupPkh(selectedVerifier: string, verifierId: string): Promise<any> {
    const fetchNodeDetails = new FetchNodeDetails({ network: this.proxy.network, proxyAddress: this.proxy.address });
    const torus = new TorusUtils();
    const verifier = this.verifierMap[selectedVerifier].verifier;
    if (!this.nodeDetails) {
      const { torusNodeEndpoints, torusNodePub, torusIndexes } = await fetchNodeDetails.getNodeDetails();
      this.nodeDetails = { torusNodeEndpoints, torusNodePub }; // Cache node details
    }
    let sanitizedVerifierId = verifierId;
    if (!this.verifierMap[selectedVerifier].caseSensitiveVerifierID) {
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
    const pk: any = await torus.getPublicAddress(this.nodeDetails.torusNodeEndpoints, this.nodeDetails.torusNodePub, { verifier, verifierId: sanitizedVerifierId }, true);
    const pkh = this.operationService.spPointsToPkh(pk.X, pk.Y);
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
      const { typeOfLogin, clientId, verifier, aggregated } = this.verifierMap[selectedVerifier];
      const loginDetails = aggregated ? await this.torus.triggerAggregateLogin({
        aggregateVerifierType: 'single_id_verifier',
        verifierIdentifier: verifier,
        subVerifierDetailsArray: [
          {
            clientId,
            typeOfLogin: typeOfLogin,
            verifier: this.verifierMap[selectedVerifier].subVerifier,
            jwtParams
          }
        ]
      }) : await this.torus.triggerLogin({
        verifier,
        typeOfLogin,
        clientId,
        jwtParams
      });
      if (aggregated) {
        loginDetails.userInfo = loginDetails.userInfo[0];
      }
      if (selectedVerifier === FACEBOOK) {
        console.log('Invalidating access token...');
        fetch(`https://graph.facebook.com/me/permissions?access_token=${loginDetails.userInfo.accessToken}`, { method: "DELETE", mode: "cors"  });
      }
      const keyPair = this.operationService.spPrivKeyToKeyPair(loginDetails.privateKey);
      console.log('DirectAuth KeyPair', keyPair);
      if (loginDetails?.userInfo?.typeOfLogin === 'jwt') {
        loginDetails.userInfo.typeOfLogin = selectedVerifier;
      }
      console.log('DirectAuth UserInfo', loginDetails.userInfo);
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
        domain: AUTH_DOMAIN
      },
      [FACEBOOK]: {
        scope: 'public_profile'
      },
      [REDDIT]: {
        domain: CONSTANTS.MAINNET ? AUTH_DOMAIN_MAINNET : AUTH_DOMAIN,
        connection: "Reddit",
        verifierIdField: "name",
        isVerifierIdCaseSensitive: false
      }
    };
  }
}
