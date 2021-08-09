import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import mimes from 'mime-db/db.json'

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['../../../../scss/components/ui/asset.component.scss']
})

export class AssetComponent implements OnInit, OnChanges {

  @Input() meta;
  @Input() size = '150x150';
  baseUrl = 'https://backend.kukai.network/file';
  mimeType;
  src;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.meta?.currentValue !== changes?.meta?.previousValue || changes?.size?.currentValue !== changes?.size?.previousValue) {
      if (this.meta?.Status === 'ok') {
        this.mimeType = Object.keys(mimes).filter(key => !!mimes[key]?.extensions?.length).find((key) => mimes[key].extensions.includes(this.meta?.Extension));
        this.src = `${this.baseUrl}/${this.meta.Filename}_${this.size}.${this.meta.Extension}`;
      } else {
        this.mimeType = 'image/*';
        this.src = '../../../../assets/img/question-mark.svg';
      }
    }
  }
}
