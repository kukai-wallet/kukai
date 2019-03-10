import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';

import { WalletService } from '../../services/wallet.service';
import { TzscanService } from '../../services/tzscan.service';
import { Chart } from 'chart.js';

import { DelegatorNamePipe } from '../../pipes/delegator-name.pipe';

import { VOTINGPERIOD, PROPOSALS } from '../../constants';
import { VOTINGPERIODHEADS } from '../../../data/bakers-list';
import { Period, PeriodKind, ParticipationPerPeriod } from '../../interfaces';

@Component({
    selector: 'app-voting',
    templateUrl: './voting.component.html',
    styleUrls: ['./voting.component.scss']
})
export class VotingComponent implements OnInit, AfterViewInit {
    @ViewChild('doughnutCanvasVotes') doughnutCanvasVotes;
    @ViewChild('doughnutCanvasParticipation') doughnutCanvasParticipation;

    proposals = null;
    proposalsHash: string[] = [];

    athensAVotes = null;
    athensBVotes = null;

    doughnutVotes: any;
    doughnutParticipation: any;

    votingPeriodHeads = VOTINGPERIODHEADS;
    currentPeriod: Period = {
        amendment: 'Athens',
        period: 10,
        period_kind: PeriodKind.Proposal,
        proposal_hash: [],
        proposal_alias: [],
        start_level: this.votingPeriodHeads[0].start_level,  // 327681
        end_level: this.votingPeriodHeads[0].end_level,  // 360448
        level: -1,
        progress: -1,
        remaining: -1
    };

    currentParticipation = {
        proposal: [],
        unused_count: -1,
        unused_votes: -1,
        total_count: -1,
        total_votes: -1
    };

    constructor(
        public walletService: WalletService,
        private tzscanService: TzscanService,
        private delegatorNamePipe: DelegatorNamePipe
    ) {}

    ngOnInit() {
        console.log('votingPeriodHeads ', this.votingPeriodHeads);

        this.tzscanService.getPeriodInfo().subscribe(
            data => {
                const periodInfo: any = data;
                // console.log('getPeriodInfo ', data);

                // Progress bar
                this.currentPeriod.level = periodInfo.level;
                this.currentPeriod.period = periodInfo.period;
                this.currentPeriod.progress = Math.round((this.currentPeriod.level - this.currentPeriod.start_level) / VOTINGPERIOD.blocks * 100);
                this.currentPeriod.remaining = Math.round(((this.currentPeriod.end_level - this.currentPeriod.level) / 60 / 24 * 100)) / 100;
                console.log('currentPeriod.period ',  this.currentPeriod.period);

                this.tzscanService.getProposalsCurrentPeriod(this.currentPeriod.period).subscribe(
                    proposalsCurrentPeriod => {
                        this.proposals = proposalsCurrentPeriod;
                        console.log('proposals ', this.proposals);

                        for (const proposal of this.proposals) {
                            this.proposalsHash.push(proposal.proposal_hash);
                            // console.log('proposal.proposal_hash ', proposal.proposal_hash);
                        }
                        console.log('proposalsHash ', this.proposalsHash);

                        this.tzscanService.getNbProposalVotes(this.proposalsHash[0]).subscribe(
                            proposalNumbers1 => {
                                //{"count":57,"votes":11408}
                                const proposalANumbers: any = proposalNumbers1;
                                const proposalA = {
                                    hash: this.proposalsHash[0],
                                    //var userType = userIsYoungerThan18 ? "Minor" : "Adult";
                                    alias: this.proposalsHash[0] = PROPOSALS[0].hash ? PROPOSALS[0].alias : PROPOSALS[1].alias,
                                    count: proposalANumbers.count,
                                    votes: proposalANumbers.votes
                                };
                                console.log('proposalA ', proposalA);

                                this.tzscanService.getNbProposalVotes(this.proposalsHash[1]).subscribe(
                                    proposalNumbers2 => {
                                        const proposalBNumbers: any = proposalNumbers2;
                                        const proposalB = {
                                            hash: this.proposalsHash[1],
                                            alias: this.proposalsHash[1] = PROPOSALS[1].hash ? PROPOSALS[1].alias : PROPOSALS[0].alias,
                                            count: proposalBNumbers.count,
                                            votes: proposalBNumbers.votes
                                        };
                                        console.log('proposalB ', proposalB);

                                        this.currentParticipation.proposal.push(proposalA, proposalB);
                                        // console.log('currentParticipation.proposal ', this.currentParticipation.proposal);

                                        //Getting the totalNumbers
                                        this.tzscanService.getTotalVotes(this.currentPeriod.period).subscribe(
                                            result => {
                                                const totalVotes: any = result;
                                                this.currentParticipation.unused_count = totalVotes.unused_count;
                                                this.currentParticipation.unused_votes = totalVotes.unused_votes;
                                                this.currentParticipation.total_count = totalVotes.total_count;
                                                this.currentParticipation.total_votes = totalVotes.total_votes;
                                                console.log('currentParticipation ', this.currentParticipation);

                                                const votersCounted = this.currentParticipation.total_count - this.currentParticipation.unused_count;
                                                const votersUndecided = this.currentParticipation.unused_count;

                                                // Vote Counts
                                                this.doughnutVotes = new Chart(this.doughnutCanvasVotes.nativeElement, {

                                                    type: 'doughnut',
                                                    data: {
                                                        labels: [this.currentParticipation.proposal[0].alias, this.currentParticipation.proposal[1].alias],
                                                        // 'Athens A: Increase gaz limits', 'Athens B: Increase gaz limits and decrease roll size'
                                                        datasets: [{
                                                            label: '# of Votes',
                                                            data: [this.currentParticipation.proposal[0].votes, this.currentParticipation.proposal[1].votes],
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

                                                // Participation
                                                this.doughnutParticipation = new Chart(this.doughnutCanvasParticipation.nativeElement, {

                                                    type: 'doughnut',
                                                    data: {
                                                        labels: ['Voted', 'To be decided'],
                                                        datasets: [{
                                                            label: '# of Votes',
                                                            data: [votersCounted, votersUndecided],
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
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    }
    ngAfterViewInit() {  // or ngAfterViewInit  // ngOnInit

        const votersCounted = this.currentParticipation.total_count - this.currentParticipation.unused_count;
        const votersUndecided = this.currentParticipation.unused_count;

        console.log('currentParticipation2 ', this.currentParticipation);  // Not working

        /*
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
        */

        /*
        this.doughnutParticipation = new Chart(this.doughnutCanvasParticipation.nativeElement, {

            type: 'doughnut',
            data: {
                labels: ['Voted', 'To be decided'],
                datasets: [{
                    label: '# of Votes',
                    data: [votersCounted, votersUndecided],
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
        */
    }
}
