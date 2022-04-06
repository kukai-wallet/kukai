import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-ui-toggle',
  templateUrl: './toggle.component.html'
})
export class ToggleComponent implements OnInit {
  @Input() state: boolean;
  @Input() text = 'Advanced:';
  @Input() default: boolean = false;
  @Output() stateChange = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit(): void {
    this.state = this.default;
  }

  toggle(): void {
    this.state = !this.state;
    this.stateChange.emit(this.state);
  }
}
