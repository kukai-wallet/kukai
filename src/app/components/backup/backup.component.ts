import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-backup',
  templateUrl: './backup.component.html',
  styleUrls: ['./backup.component.scss']
})
export class BackupComponent implements OnInit {

  items: any[] = [{id: 1, value: 'item1'}, {id: 2, value: 'item2tz1KjhfuiS9gjrQ6DodL3cfLDWkGzGvUoQux'}, {id: 3, value: 'item3'}];
  myModel: any = this.items[1];

  constructor() { }

  ngOnInit() {
  }

}
