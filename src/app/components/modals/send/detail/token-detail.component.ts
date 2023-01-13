import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalComponent } from '../../modal.component';
import { TokenBalancesService } from '../../../../services/token-balances/token-balances.service';
import { Subscription } from 'rxjs';
import { SubjectService } from '../../../../services/subject/subject.service';
import { CONSTANTS } from '../../../../../environments/environment';
import { UnlockableService } from '../../../../services/unlockable/unlockable.service';
import { ObjktService } from '../../../../services/indexer/objkt/objkt.service';
import { TokenService } from '../../../../services/token/token.service';

@Component({
  selector: 'app-token-detail',
  templateUrl: './token-detail.component.html',
  styleUrls: ['../../../../../scss/components/modals/modal.scss']
})
export class TokenDetail extends ModalComponent implements OnInit, OnDestroy {
  Object = Object;
  CONSTANTS = CONSTANTS;
  token = null;
  tokenFiltered: any = {};
  activeAccount = null;
  moreInfo = false;
  attrInfo = false;
  imageExpanded = false;
  autoOverflow = false;
  descOverflow = false;
  isNFT = false;
  assetLoaded = false;
  isAudio = false;
  name = 'token-detail';
  readonly blacklistMeta = [
    'name',
    'kind',
    'artifactAsset',
    'displayAsset',
    'thumbnailAsset',
    'rawUrl',
    'isTransferable',
    'isBooleanAmount',
    'balance',
    'category',
    'symbol',
    'decimals',
    'status',
    'shouldPreferSymbol',
    'price',
    'formats',
    'isUnknownToken'
  ];

  theme = '';

  private subscriptions: Subscription = new Subscription();
  constructor(
    private subjectService: SubjectService,
    private tokenBalancesService: TokenBalancesService,
    private tokenService: TokenService,
    private unlockableService: UnlockableService,
    private objktService: ObjktService
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.subjectService.activeAccount.subscribe((activeAccount) => {
        this.activeAccount = activeAccount;
      })
    );
    for (let type of Object.keys(CONSTANTS.FEATURE_CONTRACTS)) {
      for (let feat of Object.keys(CONSTANTS.FEATURE_CONTRACTS[type])) {
        if (document.documentElement.classList.contains(feat)) {
          this.theme = feat;
        }
        return;
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  async open(data): Promise<void> {
    this.token = data;
    !!this.token
      ? Object.keys(this.token)
          .filter((key) => !this.blacklistMeta.includes(key))
          .forEach((key) => (this.tokenFiltered[key] = this.token[key]))
      : this.token;
    this.isNFT = this.tokenBalancesService.isNFT(this.token);
    this.descOverflow = this.token?.description && this.token?.description.length > 250 ? true : false;
    this.objktService.resolveToken(this.token.contractAddress, this.token.id).then((d) => {
      if (Object.keys(this.tokenFiltered).length === 0) {
        return;
      }
      this.tokenFiltered = { ...d, ...this.tokenFiltered };
      this.tokenFiltered.attributes = this.tokenFiltered?.attributes?.sort((a, b) =>
        a.attribute.name > b.attribute.name ? 1 : a.attribute.name < b.attribute.name ? -1 : 0
      );
      const size = this.tokenService.getContractSize(this.tokenFiltered.contractAddress);
      this.tokenFiltered.attributes = this.tokenFiltered?.attributes
        ? this.tokenFiltered.attributes?.map((attr) => {
            if (attr.attribute?.attribute_counts?.length) {
              attr.attribute.freq = (attr.attribute?.attribute_counts[0].editions * 100) / size;
              attr.attribute.freq = attr.attribute.freq === 0 ? undefined : attr.attribute.freq > 100 ? '—' : attr.attribute.freq.toFixed(2) + '%';
            }
            return attr;
          })
        : [];
    });
    super.open();
  }

  close(): void {
    this.reset();
    super.close();
  }

  expand(): void {
    this.moreInfo = !this.moreInfo;
    if (!this.autoOverflow) {
      setTimeout(() => {
        this.autoOverflow = !this.autoOverflow;
      }, 160);
    } else {
      this.autoOverflow = !this.autoOverflow;
    }
  }

  expandImage(): void {
    this.imageExpanded = !this.imageExpanded;
  }

  async toggleFeature(type, feat): Promise<void> {
    this.theme = this.unlockableService.toggleFeature(type, feat) ? feat : '';
  }

  reset(): void {
    this.moreInfo = false;
    this.attrInfo = false;
    this.imageExpanded = false;
    this.descOverflow = false;
    this.assetLoaded = false;
    this.isAudio = false;
    this.tokenFiltered = {};
  }
}
