import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-agreement',
  templateUrl: './agreement.component.html',
  styleUrls: ['./agreement.component.scss']
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
    console.log(path);
    if (!accepted && path !== '/terms-of-use' && path !== '/privacy-policy') {
      this.displayAgreement = true;
    }
  }
  accept() {
    localStorage.setItem(this.key, '1');
    this.displayAgreement = false;
  }
  reject() {
    window.open('', '_self');
  }
}
