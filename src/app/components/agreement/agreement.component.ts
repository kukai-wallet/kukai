import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-agreement',
  templateUrl: './agreement.component.html',
  styleUrls: ['../../../scss/components/agreement/agreement.component.scss']
})
export class AgreementComponent implements OnInit {
  displayAgreement = false;
  key = 'accepted-terms';
  constructor(
    private location: Location
    ) { }
  ngOnInit(): void {
    // localStorage.removeItem(this.key);
    const accepted = localStorage.getItem(this.key);
    const path = this.location.path();
    if (!accepted && path !== '/terms-of-use' && path !== '/privacy-policy') {
      this.displayAgreement = true;
      const scrollBarWidth = window.innerWidth - document.body.offsetWidth;
      document.body.style.marginRight = scrollBarWidth.toString();
      document.body.style.overflowY = 'hidden';
    }
  }
  accept() {
    localStorage.setItem(this.key, '1');
    this.displayAgreement = false;
    document.body.style.marginRight = '';
    document.body.style.overflowY = '';
  }
  reject() {
    document.body.style.marginRight = '';
    document.body.style.overflowY = '';
    window.open('', '_self');
  }
}
