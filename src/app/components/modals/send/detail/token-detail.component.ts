import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalComponent } from '../../modal.component';
import { TokenBalancesService } from '../../../../services/token-balances/token-balances.service';
import { Subscription } from 'rxjs';
import { SubjectService } from '../../../../services/subject/subject.service';
import { CONSTANTS } from '../../../../../environments/environment';
import { UnlockableService } from '../../../../services/unlockable/unlockable.service';

@Component({
  selector: 'app-token-detail',
  templateUrl: './token-detail.component.html',
  styleUrls: ['../../../../../scss/components/modals/modal.scss']
})
export class TokenDetail extends ModalComponent implements OnInit, OnDestroy {
  Object = Object;
  CONSTANTS = CONSTANTS;
  token = null;
  tokenFiltered = {};
  activeAccount = null;
  moreInfo = false;
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
  constructor(private subjectService: SubjectService, private tokenBalancesService: TokenBalancesService, private unlockableService: UnlockableService) {
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

  open(data): void {
    !!data
      ? Object.keys(data)
          .filter((key) => !this.blacklistMeta.includes(key))
          .forEach((key) => (this.tokenFiltered[key] = data[key]))
      : undefined;
    this.token = data;
    this.isNFT = this.tokenBalancesService.isNFT(this.token);
    this.descOverflow = this.token?.description && this.token?.description.length > 250 ? true : false;
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
    this.imageExpanded = false;
    this.descOverflow = false;
    this.assetLoaded = false;
    this.isAudio = false;
  }
}
