import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from '../../services/message/message.service';
import { SubjectService } from '../../services/subject/subject.service';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit, OnDestroy {
  @Input() embedded: boolean;
  logo = 'default';
  private subscriptions: Subscription = new Subscription();
  constructor(
    public messageService: MessageService,
    private subjectService: SubjectService
    ) { }

  ngOnInit(): void {
    this.subjectService.origin.subscribe((o) => {
      if (o?.endsWith('truesy.com')) {
        this.logo = 'truesy';
      } else if (o?.endsWith('playwithbrio.com')) {
        this.logo = 'brio';
      } else if (o?.indexOf('minterpop') !== -1) {
        this.logo = 'minterPop';
      } else {
        this.logo = 'default';
      }
    });
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
