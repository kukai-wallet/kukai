import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import mimes from 'mime-db/db.json';
import { Asset, CachedAsset } from '../../../services/token/token.service';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['../../../../scss/components/ui/asset/asset.component.scss']
})
export class AssetComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('preImage') preImage;
  @ViewChild('postImage') postImage;
  @ViewChild('video') video;
  @ViewChild('model') model;
  @Input() meta: Asset;
  @Input() size = '150x150';
  @Output() inView = new EventEmitter(null);
  @Output() loaded = new EventEmitter(null);
  @Input() controls = false;
  @Input() autoplay = false;
  @Input() muted = false;
  @Input() offset = '0.0';
  readonly baseUrl = 'https://backend.kukai.network/file';
  readonly loaderUrl = 'assets/img/loader.svg';
  readonly unknownUrl = 'assets/img/unknown-token-grayscale.svg';
  dataSrc = undefined;
  preSrc = this.loaderUrl;
  postSrc = this.loaderUrl;
  mimeType = 'image/*';

  obs: IntersectionObserver;

  constructor() {}

  ngOnInit(): void {
    this.evaluate();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    await this.evaluate();
    if (this.preImage?.nativeElement || this.video?.nativeElement || this.model?.nativeElement) {
      this.lazyLoad();
    }
  }

  ngAfterViewInit(): void {
    this.lazyLoad();
  }

  isEqualUrl(): boolean {
    return (
      (typeof this.meta === 'string' && this.meta === this.dataSrc) ||
      (typeof this.meta === 'object' && `${this.baseUrl}/${this.meta.filename}_${this.size}.${this.meta.extension}` === this.dataSrc)
    );
  }

  onLoad(e): void {
    if (e?.target?.id === 'preImage') {
      this.postSrc = this.preSrc;
    } else if (e?.target?.id === 'postImage' && e?.target?.src.indexOf(this.loaderUrl) === -1 && e?.target?.src.indexOf(this.unknownUrl) === -1) {
      this.loaded.emit();
    }
  }

  onError(e): void {
    this.postSrc = this.unknownUrl;
  }

  async evaluate(): Promise<void> {
    if (this.isEqualUrl()) {
      return;
    }
    this.dataSrc = undefined;
    this.postSrc = this.loaderUrl;
    this.mimeType = 'image/*';
    if (typeof this.meta === 'object') {
      this.mimeType = (this.meta as any)?.mimeType
        ? (this.meta as any)?.mimeType
        : Object.keys(mimes)
            .filter((key) => !!mimes[key]?.extensions?.length)
            .find((key) => mimes[key].extensions.includes((this.meta as CachedAsset)?.extension));
      if (this.mimeType?.startsWith('model/') && (this.meta as any)?.uri?.startsWith('ipfs://')) {
        this.dataSrc = `https://cloudflare-ipfs.com/ipfs/${(this.meta as any).uri.slice(7)}`;
      } else {
        this.dataSrc = `${this.baseUrl}/${this.meta.filename}_${this.size}.${this.meta.extension}`;
      }
    } else if (typeof this.meta === 'string' && this.meta) {
      this.dataSrc = this.meta;
    } else if (!this.meta) {
      this.mimeType = 'image/*';
      this.dataSrc = this.unknownUrl;
    }
  }

  lazyLoad(): void {
    this.obs = new IntersectionObserver((entries, _) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lazyAsset = entry.target as HTMLImageElement | HTMLVideoElement;
          //console.log("lazy loading ", lazyAsset)
          this.obs.unobserve(lazyAsset);
          if (lazyAsset instanceof HTMLImageElement) {
            this.preSrc = this.dataSrc;
          } else if (this.mimeType?.startsWith('model/')) {
            this.postSrc = this.dataSrc;
          }
          this.inView.emit();
        }
      });
    });
    if (this.postImage?.nativeElement) {
      this.obs.observe(this.postImage?.nativeElement);
    }
    if (this.model?.nativeElement) {
      this.obs.observe(this.model?.nativeElement);
    }
  }
}
