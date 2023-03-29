import { Injectable } from '@angular/core';
import { TokenResponseType, TokenService } from '../token/token.service';
import { ActivityService } from '../activity/activity.service';
import { WalletService } from '../wallet/wallet.service';
import { Account } from '../wallet/wallet';
import Big from 'big.js';
import { CONSTANTS } from '../../../environments/environment';
import { decode } from 'blurhash';
import { combineLatest } from 'rxjs';
import { sampleTime } from 'rxjs/operators';
import { SubjectService } from '../subject/subject.service';
import { DipDupService } from '../indexer/dipdup/dipdup.service';

interface TokenWithBalance extends TokenResponseType {
  balance: string;
  price: string;
}
interface ContractWithImg {
  name: string;
  thumbnailUrl: string;
  visitUrl: string;
  tokens: TokenWithBalance[];
  hidden?: boolean;
}
type ContractsWithBalance = Record<string, ContractWithImg>;

@Injectable({
  providedIn: 'root'
})
export class TokenBalancesService {
  xtzUsdRate: number;
  balances: TokenWithBalance[] = [];
  nfts: ContractsWithBalance = null;
  activeAccount: Account = null;
  _thumbnailsToCreate = [];
  constructor(
    private tokenService: TokenService,
    private activityService: ActivityService,
    private walletService: WalletService,
    private subjectService: SubjectService,
    private dipdupService: DipDupService
  ) {
    combineLatest([
      this.subjectService.activeAccount,
      this.subjectService.metadataUpdated,
      this.activityService.tokenBalanceUpdated,
      this.subjectService.refreshTokens
    ])
      .pipe(sampleTime(10))
      .subscribe(([a, b, c]) => {
        if (this.activeAccount !== a) {
          this.activeAccount = a;
        }
        this.reload();
      });
    this.reload();
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
  resolveAsset(token, balances, nfts) {
    const asset: TokenResponseType = this.tokenService.getAsset(token.tokenId);
    if (asset) {
      if (this.isNFT(asset)) {
        // token balance or NFT?
        let contractAddress = asset.contractAddress;
        if (asset?.contractAddress === 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton' && asset?.mintingTool === 'https://teia.art/mint') {
          contractAddress = contractAddress + '@teia';
        }
        const contractAlias = this.getContractAlias(contractAddress) ?? contractAddress;
        if (nfts[contractAlias] === undefined) {
          const CONTRACT_ALIASES = CONSTANTS.CONTRACT_ALIASES[contractAlias as string];
          if (!CONTRACT_ALIASES?.thumbnailUrl) {
            if (this._thumbnailsToCreate.filter((obj) => obj.contractAlias === contractAlias).length === 0) {
              this._thumbnailsToCreate.push({
                contractAlias,
                address: contractAddress
              });
            }
          }
          const name = CONTRACT_ALIASES?.name ? CONTRACT_ALIASES.name : this.tokenService.getContractName(contractAddress) ?? contractAlias;
          nfts[contractAlias] = {
            name,
            thumbnailUrl: CONTRACT_ALIASES?.thumbnailUrl ?? this.tokenService.getContractLogo(contractAddress),
            tokens: []
          };
          if (CONTRACT_ALIASES?.link) {
            nfts[contractAlias].visitUrl = CONTRACT_ALIASES.link;
          }
        }
        nfts[contractAlias].tokens.push({ ...asset, balance: token.balance });
      } else if (!isNaN(asset.decimals)) {
        const balance = Big(token.balance)
          .div(10 ** asset.decimals)
          .toFixed();
        balances.push({ ...asset, balance });
      }
    } else {
      if (nfts['unknown'] === undefined) {
        const hidden = this.nfts !== null && this.nfts['unknown'] === undefined;
        nfts['unknown'] = {
          name: 'Unknown tokens',
          thumbnailUrl: '../../../assets/img/unknown-token-grayscale.svg',
          tokens: [],
          hidden
        };
        if (hidden) {
          setTimeout(() => {
            if (this.nfts['unknown'] !== undefined) {
              this.nfts['unknown'].hidden = false;
            }
          }, 10000);
        }
      }
      const placeholder = this.tokenService.getPlaceholderToken(token.tokenId);
      placeholder.name = `${placeholder.contractAddress.slice(0, 8)}... (${placeholder.id.toString()})`;
      delete placeholder.decimals;
      nfts['unknown'].tokens.push(placeholder);
    }
  }
  reload() {
    if (!this.activeAccount?.tokens || !this.tokenService.initialized) {
      return;
    }
    const balances: TokenWithBalance[] = [];
    const nfts: ContractsWithBalance = {};
    for (let token of this.walletService.wallet.getAccount(this.activeAccount.address).tokens) {
      if (token?.balance && token?.balance != '0') {
        this.resolveAsset(token, balances, nfts);
      }
    }
    this.balances = balances;
    this.nfts = this.orderedNfts(nfts);
    this.mergeMarket();

    if (this._thumbnailsToCreate.length) {
      this._thumbnailsToCreate.forEach(({ contractAlias, address }) => {
        if (!this.nfts[contractAlias].thumbnailUrl) {
          this.nfts[contractAlias].thumbnailUrl = this.getThumbnailUrl(address);
        }
      });
      this._thumbnailsToCreate = [];
    }
    this.subjectService.nftsUpdated.next({ nfts: this.nfts, balances: this.balances });
  }
  orderedNfts(nfts: ContractsWithBalance): ContractsWithBalance {
    const _nfts: ContractsWithBalance = {};
    const aliases = Object.keys(CONSTANTS.CONTRACT_ALIASES);
    for (let alias of aliases) {
      if (nfts[alias]) {
        _nfts[alias] = nfts[alias];
        delete nfts[alias];
      }
    }
    const keys = Object.keys(nfts);
    for (let key of keys) {
      if (key !== 'unknown') {
        _nfts[key] = nfts[key];
        delete nfts[key];
      }
    }
    if (nfts['unknown']) {
      // property last
      _nfts['unknown'] = nfts['unknown'];
      delete nfts['unknown'];
    }
    return _nfts;
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
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 5;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(5, 5);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  }

  isNFT(asset: TokenResponseType): boolean {
    if (!asset) {
      return false;
    }
    if (CONSTANTS.MAINNET) {
      return (
        (asset?.isBooleanAmount || asset?.decimals == 0) &&
        !(
          CONSTANTS.NFT_CONTRACT_OVERRIDES.includes(`${asset.contractAddress}:${asset.id}`) ||
          this.dipdupService.tokens.get(`${asset.contractAddress}:${asset.id}`)
        )
      );
    } else {
      return (asset?.isBooleanAmount || asset?.decimals == 0) && !CONSTANTS.NFT_CONTRACT_OVERRIDES.includes(`${asset.contractAddress}`) ? true : false;
    }
  }
  mergeMarket() {
    Object.keys(this.balances).forEach((key) => {
      let midPrice = undefined;
      const tokenId: string = `${this.balances[key]?.contractAddress}:${this.balances[key]?.id}`;
      if ((midPrice = this.dipdupService.tokens.get(tokenId))) {
        this.balances[key].price = midPrice * parseFloat(this.balances[key].balance) * this.walletService.wallet.XTZrate;
      }
    });
  }
}
