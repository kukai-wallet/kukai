import { Component, OnInit, Input } from '@angular/core';
import { Account } from '../../../../services/wallet/wallet';
import { TokenService } from '../../../../services/token/token.service';
import { SubjectService } from '../../../../services/subject/subject.service';

@Component({
  selector: 'app-basic-button',
  templateUrl: './basic.component.html'
})

export class BasicButtonComponent implements OnInit {
  constructor() { }

  ngOnInit() {
  }
}
