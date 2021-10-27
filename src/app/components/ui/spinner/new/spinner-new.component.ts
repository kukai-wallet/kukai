import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-spinner-new',
  templateUrl: './spinner-new.component.html',
  styleUrls: ['./spinner-new.component.scss']
})
export class SpinnerNewComponent implements OnInit {
  @Input() logo: string;
  constructor() { }

  ngOnInit(): void {
  }

}
