import { Injectable } from '@angular/core';
import DirectWebSdk from '@toruslabs/torus-direct-web-sdk';
import FetchNodeDetails from '@toruslabs/fetch-node-details';
import TorusUtils from '@toruslabs/torus.js';
import { OperationService } from '../../services/operation/operation.service';

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
    private operationService: OperationService
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
    const { torusNodeEndpoints, torusNodePub, torusIndexes } = await fetchNodeDetails.getNodeDetails();
    const pk: any = await torus.getPublicAddress(torusNodeEndpoints, torusNodePub, { verifier, verifierId: verifierId.toLowerCase() }, true);
    const pkh = this.operationService.spPointsToPkh(pk.X, pk.Y);
    console.log(pkh);
    this.operationService.torusKeyLookup(pkh).subscribe((ans) => {
      console.log('ans', ans);
    });
    return pkh;
  }
  async loginTorus(selectedVerifier: string, verifierId = ''): Promise<any> {
    const userInfo = {
      accessToken: "ya29.a0AfH6SMDNU4S_5ovtARVSj-N6P5PvgEKGeqekB0gXT1-biKQujFAO1DMxHxeVCuH5ZrB5OBB0hb8mcAxeGd5zdCDm7WWPKZb_-GGIeCYeN63J6Qb1bFT9u8jeYjh7Ufg91X9kSGR5pFnBndzMnF9soqQ-9EMJPJnbvJQ",
      email: "klassare@gmail.com",
      idToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjJjNmZhNmY1OTUwYTdjZTQ2NWZjZjI0N2FhMGIwOTQ4MjhhYzk1MmMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI5NTI4NzI5ODI1NTEtb2Q0NzVqZmUzYWNoN2RnaGFjaW42MzRyYmtjcWhwbGwuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5NTI4NzI5ODI1NTEtb2Q0NzVqZmUzYWNoN2RnaGFjaW42MzRyYmtjcWhwbGwuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDA4MjIxOTQzMTE4MTY2NDg1MjkiLCJlbWFpbCI6ImtsYXNzYXJlQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoibHVpVHZUMnZTX3Z1and4ZjF5dlpFUSIsIm5vbmNlIjoiQjhEUGVtMnlQdnV0dVRzRGdHR0ZvRFIzaUZCbUdNIiwibmFtZSI6IktsYXNzYXJlIiwicGljdHVyZSI6Imh0dHBzOi8vbGg1Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tNDVZZWlFQ0dCdGcvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQU1adXVja24wc0ozd0QtN0U3QVM5TFBJLWtxNGtUUG5KUS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoiS2xhc3NhcmUiLCJsb2NhbGUiOiJzdiIsImlhdCI6MTYwMDcyMDI3NywiZXhwIjoxNjAwNzIzODc3LCJqdGkiOiI4NmY5YjFkODI2MjE3ODQ3MWU4OWFlNWYwMzhlYjEwYTYyZmRkNDRiIn0.htvw9t-vakJjqjAGVnnZmLSVeOmfQ8fmVgIREg73_kfRAMQUMfQMUam3jMM5Pt00DsJSIGu4-gw92MhvWWssu395ejaNQztB49-p0frQpOyWo2DhvAqr83M3mlGsKSGyVSFGyo9neb3tO1LOCmTACQ97b1r_scuw7Zodc4_lHschDOszjAQzDlgIaoweWCYz2zO0AtfUndVmuUFcwoQjsHPWH7CCcKcPqtu6k1Z5lWumFnZMkZONJbH8iiyCrN5_s8bndnBwHJNVCKaDtV6FJNRDpP7lbMly6geJeqOQsLJm_KdSaxIvnnXb73Zl3Exmy0gVVHqqbrLYGEKzDJowbg",
      name: "Klassare",
      profileImage: "https://lh5.googleusercontent.com/-45YeiECGBtg/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuckn0sJ3wD-7E7AS9LPI-kq4kTPnJQ/photo.jpg",
      typeOfLogin: "google",
      verifier: "kukai-google",
      verifierId: "klassare@gmail.com"
    }
    const keyPair = {
      pk: "sppk7bgVcij98mArGbEpEcMTCnsidhmbRoyjMampgFGpV2Bqep5yEDS",
      pkh: "tz2Wid7AJyjT9Y2L6L8MLEtuEdUBDeAUrJ94",
      sk: "spsk1sbF5tru1ejtbvcEH8kNAB4B7c7HrxN4H6V6JPySEquixNAUBN"
    };
    return { keyPair, userInfo };
    try {
      const jwtParams = this._loginToConnectionMap()[selectedVerifier] || {};
      const { typeOfLogin, clientId, verifier } = this.verifierMap[selectedVerifier];
      if (verifierId) {
        console.log('Trigger with: ' + verifierId);
      }
      const loginDetails = await this.torus.triggerLogin({
        verifier,
        typeOfLogin,
        clientId,
        jwtParams,
        verifierId
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
