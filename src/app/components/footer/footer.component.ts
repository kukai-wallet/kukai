import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, Event, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  darkText = false;
  constructor(
    private location: Location,
    private router: Router
  ) { }

  ngOnInit(): void {
    let path = this.location.path();
    const altFooter = ['/terms-of-use', '/privacy-policy', '/settings'];
    if (altFooter.includes(path)) {
      this.darkText = true;
    }
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        path = this.location.path();
        if (altFooter.includes(path)) {
          this.darkText = true;
        } else {
          this.darkText = false;
        }
      }
    });
  }
}
