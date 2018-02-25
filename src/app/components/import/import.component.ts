import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  activePanel = 0;
  @Input() encryptedWallet = '';
  @Input() pwd = '';
  data = {
    seed: '',
    salt: ''
  };
  constructor() { }

  ngOnInit() {
  }
}
