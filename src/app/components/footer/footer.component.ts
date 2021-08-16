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
  }
}
