import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, Event, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['../../../scss/components/footer/footer.component.scss']
})
export class FooterComponent implements OnInit {
  darkText = false;
  path = '';
  constructor(
    private location: Location,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.path = this.location.path();
    this.setFooter();
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.setFooter();
      }
    });
  }
  setFooter() {
    const altFooter = ['/terms-of-use', '/privacy-policy', '/settings'];
    this.path = this.location.path();
    if (altFooter.includes(this.path)) {
      this.darkText = true;
    } else {
      this.darkText = false;
    }
  }
}
