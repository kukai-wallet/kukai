
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import mimes from 'mime-db/db.json'
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
  dataSrc = undefined;
  src = '../../../../assets/img/loader.svg';
  preSrc = '';
  postSrc = '../../../../assets/img/loader.svg';
  readonly baseUrl = 'https://backend.kukai.network/file';
  mimeType = 'image/*';

  obs: IntersectionObserver;

  constructor() { }

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
    this.lazyLoad();
    this.asset.nativeElement.onerror = this.onError.bind(this);
    this.preImage.nativeElement.onerror = this.onError.bind(this);
    this.preImage.nativeElement.onload = this.onLoad.bind(this);
  }

  onLoad() {
    this.postSrc = this.preSrc;
    this.loaded.emit();
  }

  onError() {
    this.src = '../../../../assets/img/unknown-token-grayscale.svg';
  }

  async evaluate() {
    this.dataSrc = undefined;
    this.src = this.postSrc = '../../../../assets/img/loader.svg';
    this.mimeType = 'image/*';
    if (typeof (this.meta) === 'object') {
      this.mimeType = Object.keys(mimes).filter(key => !!mimes[key]?.extensions?.length).find((key) => mimes[key].extensions.includes((this.meta as CachedAsset)?.extension));
      this.dataSrc = `${this.baseUrl}/${this.meta.filename}_${this.size}.${this.meta.extension}`;
    } else if (typeof (this.meta) === 'string' && this.meta) {
      this.dataSrc = this.meta;
    } else if (!this.meta) {
      this.mimeType = 'image/*';
      this.dataSrc = '../../../../assets/img/unknown-token-grayscale.svg';
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
            this.src = this.dataSrc;
          }
          this.obs.unobserve(lazyAsset);
        }
      })
    });
    this.obs.observe(this.asset.nativeElement);
  }
}