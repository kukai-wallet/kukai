import { Injectable } from '@angular/core';
import { TokenResponseType, TokenService } from '../token/token.service';
import { ActivityService } from '../activity/activity.service';
import { WalletService } from '../wallet/wallet.service';
import { Account } from '../wallet/wallet';
import Big from 'big.js';
import { CONSTANTS } from '../../../environments/environment';
import { decode } from "blurhash";
import { BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { SubjectService } from '../subject/subject.service';

interface TokenWithBalance extends TokenResponseType {
  balance: string;
}
interface ContractWithImg {
  name: string;
  thumbnailUrl: string;
  tokens: TokenWithBalance[];
}
type ContractsWithBalance = Record<string, ContractWithImg>;

enum UPDATE_TYPE {
  "ACCOUNT_UPDATED" = 0,
  "METADATA_UPDATED" = 1,
  "TOKENBALANCE_UPDATED" = 2
}

@Injectable({
  providedIn: 'root'
})
export class TokenBalancesService {
  balances: TokenWithBalance[] = [];
  nfts: ContractsWithBalance = null;
  activeAccount: Account = null;
  lastMetadataUpdate = null;
  lastTokenBalanceUpdate = null;
  tokenReload = new BehaviorSubject(null);
  constructor(
    private tokenService: TokenService,
    private activityService: ActivityService,
    private walletService: WalletService,
    private subjectService: SubjectService
  ) {
    combineLatest([this.walletService.activeAccount, this.walletService.walletUpdated, this.subjectService.metadataUpdated, this.activityService.tokenBalanceUpdated]).pipe(debounceTime(200)).subscribe(([a, b, c, d]) => {
      if (this.activeAccount !== a) {
        this.activeAccount = a;
      }
      this.reload(null);
    });
    this.reload(null);
    this.subjectService.logout.subscribe((o) => {
      if (!!o) {
        this.destroy();
      }
    });
  }
  destroy() {
    this.balances = [];
    this.nfts = null;
  }
  resolveAsset(token, balances, nfts, _thumbnailsToCreate) {
    const asset = this.tokenService.getAsset(token.tokenId);
    if (asset) {
      if (this.isNFT(asset)) { // token balance or NFT?
        const contractAlias = this.getContractAlias(asset.contractAddress) ?? asset.contractAddress;
        if (nfts[contractAlias] === undefined) {
          let thumbnailUrl = CONSTANTS.CONTRACT_ALIASES[(contractAlias as string)]?.thumbnailUrl;
          if (!thumbnailUrl) {
            _thumbnailsToCreate.push({ contractAlias, address: asset.contractAddress });
          }
          nfts[contractAlias] = { name: contractAlias, thumbnailUrl, tokens: [] };
        }
        nfts[contractAlias].tokens.push({ ...asset, balance: token.balance });
      } else {
        const balance = Big(token.balance).div(10 ** asset.decimals).toFixed();
        balances.push({ ...asset, balance });
      }
    }
  }

  reload(type: number = undefined) {
    if (this.activeAccount) {
      const balances: TokenWithBalance[] = [];
      const nfts: ContractsWithBalance = {};
      const _thumbnailsToCreate = [];
      for (let token of this.activeAccount.tokens) {
        if (token.balance && token.balance !== '0') {
          this.resolveAsset(token, balances, nfts, _thumbnailsToCreate);
        }
      }
      this.balances = balances;
      this.nfts = nfts;

      if (_thumbnailsToCreate.length) {
        setTimeout(() => {
          for (let { contractAlias, address } of _thumbnailsToCreate) {
            if (!this.nfts[contractAlias].thumbnailUrl) {
              this.nfts[contractAlias].thumbnailUrl = this.getThumbnailUrl(address);
            }
          }
        }, 0);
      }
    }
  }
  getContractAlias(address: string) {
    const keys = Object.keys(CONSTANTS.CONTRACT_ALIASES);
    for (const key of keys) {
      if (CONSTANTS.CONTRACT_ALIASES[key].address.includes(address)) {
        return key;
      }
    }
    return undefined;
  }
  getThumbnailUrl(address: string): string {
    const pixels = decode(address.slice(0, 22), 5, 5);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 5;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(5, 5);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  }

  isNFT(asset): boolean {
    return (asset?.isBooleanAmount || asset?.decimals == 0) && !CONSTANTS.NFT_CONTRACT_OVERRIDES.includes(asset?.contractAddress) ? true : false;
  }
}
