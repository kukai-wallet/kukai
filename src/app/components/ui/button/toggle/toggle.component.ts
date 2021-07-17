import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-ui-toggle',
  templateUrl: './toggle.component.html',
})
export class ToggleComponent implements OnInit {
  state: boolean;
  @Input() default: boolean = false;
  @Output() stateChange = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
    this.state = this.default;
  }

  toggle() {
    this.state = !this.state;
    this.stateChange.emit(this.state);
  }

}