import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-agreement',
  templateUrl: './agreement.component.html',
  styleUrls: ['./agreement.component.scss']
})
export class AgreementComponent implements OnInit {
  displayAgreement = false;
  key = 'accepted-terms';
  constructor() { }
  ngOnInit(): void {
    // localStorage.removeItem(this.key);
    const accepted = localStorage.getItem(this.key);
    if (!accepted) {
      this.displayAgreement = true;
    }
  }
  accept() {
    localStorage.setItem(this.key, '1');
    this.displayAgreement = false;
  }
}
