import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['../../../../../../scss/components/views/start/agreement/terms-of-use/terms-of-use.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
  getHostName(): string {
    return location.hostname;
  }
}
