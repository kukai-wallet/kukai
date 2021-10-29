import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {

  @Input() current;
  @Input() list: any [];

  constructor() { }

  ngOnInit(): void {

  }
}
