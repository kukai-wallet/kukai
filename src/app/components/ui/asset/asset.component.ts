import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import mimes from 'mime-db/db.json'
import { CachedAssetResponse } from '../../../interfaces';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['../../../../scss/components/ui/asset.component.scss']
})

export class AssetComponent implements OnInit, OnChanges {

  @Input() meta: CachedAssetResponse | string;
  @Input() size = '150x150';
  src = undefined;
  baseUrl = 'https://backend.kukai.network/file';
  mimeType = 'image/*';

  constructor() { }

  ngOnInit() {
    this.evaluate();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.evaluate();
  }
  async evaluate() {
    this.src = undefined;
    if ((this.meta as CachedAssetResponse)?.Status === 'ok') {
      this.mimeType = Object.keys(mimes).filter(key => !!mimes[key]?.extensions?.length).find((key) => mimes[key].extensions.includes((this.meta as CachedAssetResponse)?.Extension));
      if(this.mimeType.startsWith('model/') && !(window as any)?.__THREE__) {
        await this.modelInit();
      }
      this.src = `${this.baseUrl}/${(this.meta as CachedAssetResponse).Filename}_${this.size}.${(this.meta as CachedAssetResponse).Extension}`;
    } else if (typeof (this.meta) === 'string') {
      this.src = this.meta;
    } else if (!this.src) {
      this.mimeType = 'image/*';
      this.src = '../../../../assets/img/question-mark.svg';
    }
  }

  async modelInit() {
    await fetch('https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js').then(response => response.blob()).then(async blob => {
      const script = document.createElement('script');
      document.querySelector('head').appendChild(script.appendChild(document.createTextNode(await blob.text())));
    });
  }
}