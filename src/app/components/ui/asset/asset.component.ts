import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, Sanitizer, SimpleChanges, ViewChild } from '@angular/core';
import { Asset, CachedAsset, TokenService } from '../../../services/token/token.service';
import { CONSTANTS } from '../../../../environments/environment';
import { AppComponent } from '../../../app.component';
import { KukaiService } from '../../../services/kukai/kukai.service';

enum Display {
  'none',
  'audio',
  'image',
  'video',
  'threeD'
}

enum Size {
  'icon' = 'icon',
  'small' = 'small',
  'medium' = 'medium',
  'gallery' = 'gallery',
  'raw' = 'raw'
}

const MIMETYPE_OVERLOADS = ['unknown', 'image/gif'];

const URL_OVERRIDE_LIST = {
  'https://data.mantodev.com/media/medium/ipfs/QmeixniZcQoDBe9gyNFhk87xyzdFyrK7ngk9whi4nL7FH2':
    'https://ipfs.io/ipfs/QmeixniZcQoDBe9gyNFhk87xyzdFyrK7ngk9whi4nL7FH2'
};

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['../../../../scss/components/ui/asset/asset.component.scss']
})
export class AssetComponent implements OnInit, AfterViewInit {
  AppComponent = AppComponent;
  Display = Display;
  display = Display.image;
  @ViewChild('preImage') preImage;
  @ViewChild('postImage') postImage;
  @ViewChild('audio') audio;
  @ViewChild('video') video;
  @ViewChild('model') model;
  @Input() assets: any;
  @Input() size = Size.medium;
  @Input() priorityList = ['displayAsset', 'thumbnailAsset'];
  @Input() controlsList = 'nofullscreen nodownload noremoteplayback noplaybackrate';
  @Input() poster: CachedAsset;
  @Input() controls = false;
  @Input() requires = ['all'];
  @Input() hideSpinner = false;
  @Input() muted = false;
  @Input() autoplay = false;
  @Input() loop = false;
  @Input() playsinline = false;
  @Output() inView = new EventEmitter(null);
  @Output() load = new EventEmitter(null);
  readonly loaderUrl = 'assets/img/loader.svg';
  readonly unknownUrl = 'assets/img/unknown-token-grayscale.svg';
  dataSrc = undefined;
  preSrc = this.loaderUrl;
  postSrc = this.loaderUrl;
  mimeType = 'image/*';
  errors = 0;
  obs: IntersectionObserver;

  constructor(private elRef: ElementRef, private tokenService: TokenService, private kukaiService: KukaiService) {}

  ngOnInit(): void {
    if (this.hideSpinner) {
      this.display = Display.none;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes?.assets?.previousValue &&
      changes?.assets?.currentValue &&
      JSON.stringify(changes?.assets?.previousValue) !== JSON.stringify(changes?.assets?.currentValue)
    ) {
      const p0 = this.assetToUrl(this.pickAsset(changes?.assets?.previousValue));
      const p1 = this.assetToUrl(this.pickAsset(changes?.assets?.currentValue));
      if (p0 !== p1) {
        console.log('reload asset', { from: p0, to: p1 });
        this.reload();
      }
    }
  }

  ngAfterViewInit(): void {
    this.lazyLoad();
  }
  private reload() {
    this.display = Display.none;
    this.dataSrc = undefined;
    this.preSrc = this.loaderUrl;
    this.postSrc = this.loaderUrl;
    this.mimeType = 'image/*';
    this.updateDisplay();
    this.lazyLoad();
  }
  updateDisplay(): void {
    if (this.isImage() && (this.requires.includes('image') || this.requires.includes('all'))) {
      this.display = Display.image;
    } else if (this.isAudio() && (this.requires.includes('audio') || this.requires.includes('all'))) {
      this.display = Display.audio;
    } else if (this.isVideo() && (this.requires.includes('video') || this.requires.includes('all'))) {
      this.display = Display.video;
    } else if (this.is3D() && (this.requires.includes('model') || this.requires.includes('all'))) {
      if (!AppComponent.hasWebGL) {
        this.evaluateInvalid();
        return;
      }
      this.display = Display.threeD;
    } else {
      this.display = Display.none;
    }
  }

  isImage(): boolean {
    return this.mimeType?.startsWith('image/') || this.mimeType?.startsWith('application/');
  }

  isVideo(): boolean {
    return this.mimeType?.startsWith('video/');
  }

  isAudio(): boolean {
    return this.mimeType?.startsWith('audio/');
  }

  is3D(): boolean {
    return this.mimeType?.startsWith('model/');
  }

  onLoad(e): void {
    if (e?.target?.id === 'preImage') {
      this.postSrc = this.preSrc;
      this.updateDisplay();
    }
  }

  onLoadData(e): void {
    if (this.isAudio()) {
      if (this.audio.nativeElement.muted) {
        this.audio.nativeElement.volume = 1.0;
      }
    }
  }

  onError(e): void {
    if ((e?.target?.id === 'postImage' || e?.target?.id === 'preImage') && this.isImage()) {
      this.errors++;
      if (this.errors <= 2) {
        console.log('retry lazyload', this.preSrc);
        this.reload();
      } else {
        console.log('failed to load asset', this.preSrc);
        this.evaluateInvalid();
      }
    }
  }

  evaluateInvalid(): void {
    this.mimeType = 'image/*';
    this.updateDisplay();
    this.preSrc = this.unknownUrl;
  }
  pickAsset(assets): Asset {
    for (let type of this.priorityList) {
      if (assets && assets[type] && !(typeof assets[type] === 'object' && !assets[type]?.uri)) {
        return assets[type];
      }
    }
    return null;
  }

  async evaluate(assets): Promise<void> {
    if (this.poster) {
      this.preSrc = this.assetToUrl(this.poster);
    }
    let asset = this.pickAsset(assets);
    if (asset) {
      try {
        await this.determineMime(asset);
      } catch (e) {
        console.error(e);
        this.evaluateInvalid();
        return;
      }
      this.setSrc(asset);
    } else {
      this.evaluateInvalid();
    }
  }

  lazyLoad(): void {
    this.obs = new IntersectionObserver((entries, _) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.evaluate(this.assets);
          this.obs.unobserve(this.elRef?.nativeElement);
        }
        this.inView.emit();
      });
    });
    if (this.elRef?.nativeElement) {
      this.obs.observe(this.elRef?.nativeElement);
    }
  }

  async determineMime(asset: Asset) {
    const url = this.assetToUrl(asset);
    if (!url) {
      throw new Error('InvalidUrl');
    }
    if (url?.startsWith('data:image')) {
      this.mimeType = 'image/*';
      return (this.preSrc = url);
    }
    // Ignore MIME type provided in metadata for now. Way too unreliable. Exception for nfts in 3d wl. (media proxy don't return the correct mime type)
    if (
      typeof asset !== 'string' &&
      !(asset?.mimeType?.startsWith('model/') && this.kukaiService.model3dAllowList.includes(this.tokenService.getContractAddressFromAsset(asset?.uri)))
    ) {
      let response;
      for (let i = 0; i < 3 && !response?.ok; i++) {
        response = await fetch(url, { method: 'GET' });
      }
      if (!response?.ok) {
        throw new Error('Failed to fetch asset');
      }
      this.mimeType = response.headers.get('content-type');
    } else if (typeof asset === 'string') {
      this.mimeType = 'image/*';
    } else {
      this.mimeType = asset.mimeType;
    }
  }

  setSrc(asset): void {
    this.updateDisplay();
    if (this.isAudio() || this.isVideo() || this.is3D()) {
      this.isAudio() ? this.load.emit() : undefined;
      if (this.is3D()) {
        const contractAddress = this.tokenService.getContractAddressFromAsset(asset?.uri);
        if (!this.kukaiService.model3dAllowList.includes(contractAddress)) {
          console.warn('Content blocked');
          this.evaluateInvalid();
          return;
        }
      }
      this.dataSrc = this.assetToUrl(asset);
    } else if (this.isImage()) {
      this.preSrc = this.assetToUrl(asset);
    } else {
      console.warn(`Unrecognized MIME type: ${this.mimeType}`, '\n', 'Assuming: image/*');
      this.mimeType = 'image/*';
      this.updateDisplay();
      this.preSrc = this.assetToUrl(asset);
    }
  }
  assetToUrl(asset: Asset): string {
    let url = '';
    const uri = typeof asset === 'string' ? asset : asset?.uri;
    if (uri.startsWith('ipfs://')) {
      const mediaAndSize = this.size === Size.raw ? '' : `media/${this.size}/`;
      url = `https://data.mantodev.com/${mediaAndSize}ipfs/${uri.slice(7)}`;
    } else if (uri.startsWith('https://imagedelivery.net/X6w5bi3ztwg4T4f6LG8s0Q')) {
      url = uri;
    } else if (uri.startsWith('https://')) {
      url = `https://data.mantodev.com/media/${this.size}/web/${uri.slice(8)}`;
    } else if (!CONSTANTS.MAINNET && (uri.startsWith('http://localhost') || uri.startsWith('http://127.0.0.1'))) {
      url = uri.slice(16);
    } else if (typeof asset === 'string') {
      url = uri;
    } else {
      console.error('failed to parse asset', asset);
    }
    return URL_OVERRIDE_LIST[url] ?? url ?? '';
  }
}
