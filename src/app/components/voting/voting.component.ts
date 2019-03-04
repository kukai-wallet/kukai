import { Component, ViewChild, AfterViewInit } from '@angular/core';

import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { ActivityService } from '../../services/activity.service';
import { Chart } from 'chart.js';

import { DelegatorNamePipe } from '../../pipes/delegator-name.pipe';


@Component({
    selector: 'app-voting',
    templateUrl: './voting.component.html',
    styleUrls: ['./voting.component.scss']
})
export class VotingComponent implements AfterViewInit {
    @ViewChild('doughnutCanvasVotes') doughnutCanvasVotes;
    @ViewChild('doughnutCanvasParticipation') doughnutCanvasParticipation;

    doughnutVotes: any;
    doughnutParticipation: any;

    constructor(
        public walletService: WalletService,
        private messageService: MessageService,
        private activityService: ActivityService,
        private delegatorNamePipe: DelegatorNamePipe
    ) { }

    ngAfterViewInit() {  // or ngAfterViewInit  // ngOnInit
        this.doughnutVotes = new Chart(this.doughnutCanvasVotes.nativeElement, {

            type: 'doughnut',
            data: {
                labels: ['Athens A', 'Athens B', 'Don\'t change anything'],
                // 'Athens A: Increase gaz limits', 'Athens B: Increase gaz limits and decrease roll size'
                datasets: [{
                    label: '# of Votes',
                    data: [12, 19, 3],
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56'
                    ],
                    hoverBackgroundColor: [
                        '#cc4f69',
                        '#2b81bc',
                        '#cca444'
                    ]
                }]
            }

        });

        this.doughnutParticipation = new Chart(this.doughnutCanvasParticipation.nativeElement, {

            type: 'doughnut',
            data: {
                labels: ['Voted', 'To be decided'],
                datasets: [{
                    label: '# of Votes',
                    data: [3, 5],
                    backgroundColor: [
                        '#00bc6c',
                        '#9f9ff0'
                    ],
                    hoverBackgroundColor: [
                        '#009656',
                        '#7f7fc0'
                    ]
                }]
            }

        });
    }
}
