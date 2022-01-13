import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-queue-embed',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss']
})
export class QueueEmbedComponent implements OnInit {
  @Input('queueTime') queueTime = 0;
  hours = "0";
  minutes = "0";
  seconds = "0";
  constructor() { }
  ngOnInit(): void {
    this.updateTime();
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.queueTime.currentValue !== changes.queueTime.previousValue) {
      this.updateTime();
    }
  }

  updateTime() {
    let sec: any = this.queueTime;
    let hrs: any = Math.floor(sec / 3600);
    sec -= hrs * 3600;
    let min: any = Math.floor(sec / 60);
    sec -= min * 60;
    sec = sec.toString();
    min = min.toString();
    hrs = hrs.toString();

    this.hours = hrs.length < 2 ? "0" + hrs : hrs; 
    this.minutes = min.length < 2 ? "0" + min : min;
    this.seconds = sec.length < 2 ? "0" + sec : sec;
  }
}