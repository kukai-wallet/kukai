import { Component, OnInit } from '@angular/core';
import { ToggleComponent } from '../toggle.component';

@Component({
  selector: 'app-ui-toggle-advanced',
  templateUrl: './advanced.component.html',
  styleUrls: ['../../../../../../scss/components/ui/toggle.component.scss']
})
export class AdvancedToggleComponent extends ToggleComponent implements OnInit {

  constructor() { super(); }

  ngOnInit(): void {
  }

}