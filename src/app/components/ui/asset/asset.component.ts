
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import mimes from 'mime-db/db.json'
import { throwError } from 'rxjs';
import { Asset, CachedAsset } from '../../../services/token/token.service';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['../../../../scss/components/ui/asset/asset.component.scss']
})

export class AssetComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('asset') asset;
  @ViewChild('preImage') preImage;
  @Input() meta: Asset;
  @Input() size = '150x150';
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

  constructor() {
  }

  ngOnInit() {
    this.evaluate();
  }

  async ngOnChanges(changes: SimpleChanges) {
    await this.evaluate();
    if (this.asset?.nativeElement) {
      this.lazyLoad();
    }
  }

  ngAfterViewInit() {
    this.asset.nativeElement.onerror = this.onError.bind(this);
    this.asset.nativeElement.onload = this.onLoad.bind(this);
    this.preImage.nativeElement.onerror = this.onError.bind(this);
    this.preImage.nativeElement.onload = this.onLoad.bind(this);
    this.lazyLoad();
  }

  isEqualUrl() {
    return (typeof (this.meta) === 'string' && this.meta === this.dataSrc || typeof (this.meta) === 'object' && `${this.baseUrl}/${this.meta.filename}_${this.size}.${this.meta.extension}` === this.dataSrc);
  }

  onLoad(e) {
    if (e?.target?.id === 'preImage') {
      this.postSrc = this.preSrc;
    } else if (e?.target?.id === 'postImage' && e?.target?.src.indexOf(this.loaderUrl) === -1 && e?.target?.src.indexOf(this.unknownUrl) === -1) {
      this.loaded.emit();
    }
  }

  onError(e) {
    this.postSrc = this.unknownUrl;
  }

  async evaluate() {
    if(this.isEqualUrl()) { return; }
    this.dataSrc = undefined;
    this.postSrc = this.loaderUrl;
    this.mimeType = 'image/*';
    if (typeof (this.meta) === 'object') {
      this.mimeType = Object.keys(mimes).filter(key => !!mimes[key]?.extensions?.length).find((key) => mimes[key].extensions.includes((this.meta as CachedAsset)?.extension));
      this.dataSrc = `${this.baseUrl}/${this.meta.filename}_${this.size}.${this.meta.extension}`;
    } else if (typeof (this.meta) === 'string' && this.meta) {
      this.dataSrc = this.meta;
    } else if (!this.meta) {
      this.mimeType = 'image/*';
      this.dataSrc = this.unknownUrl;
    }
  }

  async modelInit() {
    await fetch('https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js').then(response => response.blob()).then(async blob => {
      document.querySelector('head').appendChild(document.createElement('script').appendChild(document.createTextNode(await blob.text())));
    });
  }

  lazyLoad() {
    this.obs = new IntersectionObserver((entries, _) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lazyAsset = entry.target as HTMLImageElement | HTMLVideoElement;
          //console.log("lazy loading ", lazyAsset)
          if (lazyAsset instanceof HTMLImageElement) {
            this.preSrc = this.dataSrc;
          } else {
            this.postSrc = this.dataSrc;
          }
          this.obs.unobserve(lazyAsset);
        }
      })
    });
    this.obs.observe(this.asset?.nativeElement);
  }
}