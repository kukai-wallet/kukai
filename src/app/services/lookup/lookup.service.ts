import { Injectable } from '@angular/core';
import { OperationService } from '../../services/operation/operation.service';
import { TorusService } from '../../services/torus/torus.service';
import { WalletService } from '../../services/wallet/wallet.service';
import { InputValidationService } from '../../services/input-validation/input-validation.service';
import { TezosDomainsService } from '../../services/tezos-domains/tezos-domains.service';

enum LookupType { // ordered in priority
  AddressBook,
  TezosDomains,
  Google,
  Reddit,
  Twitter,
  Alias
}

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  public records: { address: string, data: { name: string, lookupType: LookupType }[] }[] = [];
  private pendingLookups: Record<string, number> = {};
  constructor(
    private operationService: OperationService,
    private torusService: TorusService,
    private walletService: WalletService,
    private inputValidationService: InputValidationService,
    private tezosDomainsService: TezosDomainsService
  ) {
    this.initCheck();
  }
  initCheck() {
    if (!this.records.length &&
      this.walletService.wallet &&
      this.walletService.wallet.lookups.length) {
      console.log('### Loading lookups from memory');
      this.records = this.walletService.wallet.lookups;
    }
  }
  add(address: string, name: string, lookupType: LookupType) {
    console.log('#name', name);
    const { x, y } = this.index(address, lookupType);
    if (x !== -1) {
      if (y === -1) {
        this.records[x].data.push({ name, lookupType });
      }
    } else {
      this.records.push({ address, data: [{ name, lookupType }] });
    }
    this.walletService.wallet.lookups = this.records;
    this.walletService.storeWallet();
  }
  clear() {
    this.records = [];
    this.pendingLookups = {};
  }
  mark(address: string) {
    const { x, y } = this.indexTop(address);
    if (x === -1) {
      this.records.push({ address, data: [] });
    }
    this.walletService.storeWallet();
  }
  async recheckWalletAddresses(force: boolean) {
    console.log('lookup wallet addresses');
    for (const address of this.walletService.wallet.getImplicitAccounts()) {
      this.check(address, force);
    }
  }
  async check(address: any, force: boolean = false) {
    if (address?.address !== undefined) {
      address = address.address;
    }
    this.initCheck();
    if (force) {
      console.log('Forced recheck for: ' + address);
    }
    if (address && !this.pendingLookups[address]) {
      const { x } = this.index(address, 0);
      if (x === -1 || force) {
        // DirectAuth
        if (address.slice(0, 3) === 'tz2') {
          if (x === -1) {
            this.pendingLookups[address]++;
            this.torusLookup(address);
          }
        }
        // Tezos Domains
        this.pendingLookups[address]++;
        let domain = '';
        try {
          domain = await this.tezosDomainsService.getDomainFromAddress(address);
        } catch (e) {
          console.log(address, e);
          this.pendingLookups[address]--;
          return;
        }
        this.pendingLookups[address]--;
        console.log(address + ' -> ' + domain);
        if (domain) {
          this.add(address, domain, LookupType.TezosDomains);
        } else {
          this.mark(address);
        }
      }
    }
  }
  torusLookup(address: string) {
    this.operationService.torusKeyLookup(address).subscribe(async (ans: any) => {
      if (ans) {
        if (
          ans.result &&
          ans.result.Verifiers
        ) {
          const keys = Object.keys(ans.result.Verifiers);
          const verifierMap = this.torusService.verifierMap;
          for (const key of keys) {
            if (key === verifierMap['google'].verifier) {
              this.add(address, ans.result.Verifiers[verifierMap['google'].verifier][0], LookupType.Google);
            } else if (key === verifierMap['reddit'].verifier) {
              this.add(address, ans.result.Verifiers[verifierMap['reddit'].verifier][0], LookupType.Reddit);
            } else if (key === verifierMap['twitter'].verifier) {
              const verifierId = ans.result.Verifiers[verifierMap['twitter'].verifier][0];
              const verifierArray = verifierId.split('|');
              if (verifierArray[0] === 'twitter' && this.inputValidationService.twitterId(verifierArray[1])) {
                const twitterId = verifierArray[1];
                const { username } = await this.torusService.twitterLookup(undefined, twitterId);
                if (username) {
                  this.add(address, '@' + username, LookupType.Twitter);
                }
              }
            } else {
              console.log('Unhandled verifier result', ans);
            }
          }
          this.pendingLookups[address]--;
        } else if (!ans.noReveal) {
          this.mark(address);
        }
      }
    });
  }
  torusEntryExist(address: string): boolean {
    const record = this.records[address];
    if (record) {
      for (const entry of record) {
        if (entry.lookupType > 1) {
          return true;
        }
      }
    }
    return false;
  }
  index(address: string, lookupType: LookupType) {
    let [x, y] = Array(2).fill(-1);
    for (let i = 0; i < this.records.length; i++) {
      if (this.records[i].address === address) {
        x = i;
        for (let j = 0; j < this.records[i].data.length; j++) {
          if (this.records[i].data[j].lookupType === lookupType) {
            y = j;
          }
        }
      }
    }
    return { x, y };
  }
  indexTop(address: string) {
    let [x, y] = Array(2).fill(-1);
    for (let i = 0; i < this.records.length; i++) {
      if (this.records[i].address === address) {
        x = i;
        for (let j = 0; j < this.records[i].data.length; j++) {
          if (this.records[i].data[j].lookupType < y || y === -1) {
            y = j;
          }
        }
      }
    }
    return { x, y };
  }
  resolve(party: any): any {
    this.initCheck();
    const { x, y } = this.indexTop(party.address);
    if (x !== -1 && y !== -1) {
      return { name: this.records[x].data[y].name, lookupType: this.records[x].data[y].lookupType, address: party.address };
    } else if (party.alias) {
      return { name: party.alias, lookupType: LookupType.Alias, address: party.address };
    }
    return { address: party.address };
  }
}
