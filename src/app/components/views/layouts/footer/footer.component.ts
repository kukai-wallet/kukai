import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['../../../../../scss/components/views/layouts/footer/footer.component.scss']
})
export class FooterComponent implements OnInit {
  darkText = false;
  path = '';
  constructor() {}

  ngOnInit(): void {}
}
