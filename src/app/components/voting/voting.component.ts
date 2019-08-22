import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';

import { WalletService } from '../../services/wallet.service';
import { TzscanService } from '../../services/tzscan.service';
import { Chart } from 'chart.js';

import { DelegatorNamePipe } from '../../pipes/delegator-name.pipe';

import { VOTINGPERIOD } from '../../constants';
import { Period, Ballot } from '../../interfaces';

@Component({
    selector: 'app-voting',
    templateUrl: './voting.component.html',
    styleUrls: ['./voting.component.scss']
})
export class VotingComponent implements OnInit {
    @ViewChild('doughnutCanvasVotes', {static: false}) doughnutCanvasVotes;
    @ViewChild('doughnutCanvasParticipation', {static: false}) doughnutCanvasParticipation;

    proposals = null;  //For proposal period
    proposalsHash: string[] = [];
    ballot: Ballot = {  //For the other 3 periods (Exploration, Testing, Promotion)
        proposal: '',
        nb_yay: -1,
        nb_nay: -1,
        nb_pass: -1,
        vote_yay: -1,
        vote_nay: -1,
        vote_pass: -1
    };

    athensAVotes = null;
    athensBVotes = null;

    isSuperMajority = true;
    isBakersParticipation = true;

    doughnutVotes: any;
    doughnutParticipation: any;

    currentPeriod: Period = {
        amendment: 'Athens',
        period: 10,
        period_kind: '',  //PeriodKind.Proposal
        proposal_hash: [],
        proposal_alias: [],
        start_level: 0,  // 327681
        end_level: 0,  // 360448 - not used
        level: -1,
        progress: -1,
        remaining: -1
    };

    currentParticipation = {
        proposal: [],
        unused_count: 0,
        unused_votes: 0,
        total_count: 0,
        total_votes: 0
    };

    constructor(
        public walletService: WalletService,
        private tzscanService: TzscanService
    ) { }

    showDoughnutCharts(currentParticipation: any) {
        const votersCounted = currentParticipation.total_count - currentParticipation.unused_count;
        const votersUndecided = currentParticipation.unused_count;

        if (this.currentPeriod.period_kind === 'Proposal') {  // In proposal period, with multiple proposals
            // Vote Counts
            const labels = [];
            const data = [];
            if (currentParticipation.proposal) {
                for (const proposal of currentParticipation.proposal) {
                    labels.push(proposal.alias.slice(0, 9) + '... ');
                    data.push(proposal.votes);
                }
            }
            this.doughnutVotes = new Chart(this.doughnutCanvasVotes.nativeElement, {

                type: 'doughnut',
                data: {
                    labels: labels,
                    // 'Athens A: Increase gaz limits', 'Athens B: Increase gaz limits and decrease roll size'
                    datasets: [{
                        label: '# of Votes',
                        data: data,
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

        } else {  // In ballot period
            // Check SuperMajority
            this.isSuperMajority = this.ballot.vote_yay / (this.ballot.vote_yay + this.ballot.vote_nay) > 0.8;
            // console.log('Yes supermajority: ', this.ballot.vote_yay / (this.ballot.vote_yay + this.ballot.vote_nay) > 0.8);

            // Vote Counts
            this.doughnutVotes = new Chart(this.doughnutCanvasVotes.nativeElement, {

                type: 'doughnut',
                data: {
                    labels: ['Yes', 'No', 'Pass'],
                    datasets: [{
                        label: '# of Votes',
                        data: [this.ballot.vote_yay, this.ballot.vote_nay, this.ballot.vote_pass],
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
        }

        // Bakers Participation
        this.showParticipationDoughnutCharts(currentParticipation);
    }

    showParticipationDoughnutCharts(currentParticipation: any) {
        const votersCounted = currentParticipation.total_count - currentParticipation.unused_count;
        const votersUndecided = currentParticipation.unused_count;

        // Bakers Participation
        this.doughnutParticipation = new Chart(this.doughnutCanvasParticipation.nativeElement, {

            type: 'doughnut',
            data: {
                labels: ['Voted', 'To be decided'],
                datasets: [{
                    label: '# of Votes',
                    data: [this.currentParticipation.total_votes - this.currentParticipation.unused_votes, this.currentParticipation.unused_votes],
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

    toggleParticipationCharts() {
        this.isBakersParticipation = !this.isBakersParticipation;
        console.log(this.isBakersParticipation);
        if (this.isBakersParticipation) {
            this.doughnutParticipation.data.datasets.forEach((dataset) => {
                dataset.data.pop();
                dataset.data.pop();
                dataset.data.push(this.currentParticipation.total_votes - this.currentParticipation.unused_votes);
                dataset.data.push(this.currentParticipation.unused_votes);
            });
            this.doughnutParticipation.update();
        } else {
            // Vote counts
            this.doughnutParticipation.data.datasets.forEach((dataset) => {
                dataset.data.pop();
                dataset.data.pop();
                dataset.data.push(this.currentParticipation.total_count - this.currentParticipation.unused_count);
                dataset.data.push(this.currentParticipation.unused_count);
            });
            this.doughnutParticipation.update();
        }
    }

    ngOnInit() {
        this.tzscanService.getPeriodInfo().subscribe(
            data => {
                const periodInfo: any = data;
                console.log('getPeriodInfo ', data);

                //Check Voting Period Type
                switch (periodInfo.kind) {
                    case 'proposal': {
                        this.currentPeriod.period_kind = 'Proposal';  //PeriodKind.Proposal
                        break;
                    }
                    case 'testing_vote': {
                        this.currentPeriod.period_kind = 'Exploration';  //PeriodKind.Exploration
                        this.currentPeriod.start_level = this.currentPeriod.start_level + VOTINGPERIOD.blocks;
                        this.currentPeriod.end_level = this.currentPeriod.end_level + VOTINGPERIOD.blocks;
                        break;
                    }
                    case 'testing': {
                        this.currentPeriod.period_kind = 'Testing';  //PeriodKind.Testing
                        this.currentPeriod.start_level = this.currentPeriod.start_level + VOTINGPERIOD.blocks * 2;
                        this.currentPeriod.end_level = this.currentPeriod.end_level + VOTINGPERIOD.blocks * 2;
                        break;
                    }
                    case 'promotion_vote': {
                        this.currentPeriod.period_kind = 'Promotion';  //PeriodKind.Promotion
                        this.currentPeriod.start_level = this.currentPeriod.start_level + VOTINGPERIOD.blocks * 3;
                        this.currentPeriod.end_level = this.currentPeriod.end_level + VOTINGPERIOD.blocks * 3;
                        break;
                    }
                    default: {
                        console.log('Error with period type');
                        break;
                    }
                }

                // Progress bar
                this.currentPeriod.level = periodInfo.level;
                this.currentPeriod.period = periodInfo.period;
                this.currentPeriod.progress = Math.round((this.currentPeriod.level % 32768) / VOTINGPERIOD.blocks * 100);
                this.currentPeriod.remaining = Math.round(((32768 - (this.currentPeriod.level % 32768)) / 60 / 24 * 100)) / 100;
                console.log('currentPeriod.period ', this.currentPeriod.period);

                this.tzscanService.getProposalsCurrentPeriod(this.currentPeriod.period).subscribe(
                    proposalsCurrentPeriod => {
                        this.proposals = proposalsCurrentPeriod;
                        console.log('proposals ', this.proposals);

                        for (const proposal of this.proposals) {
                            this.proposalsHash.push(proposal.proposal_hash);
                            // console.log('proposal.proposal_hash ', proposal.proposal_hash);
                        }
                        console.log('proposalsHash ', this.proposalsHash);

                        //For Proposal Period, to get counts and votes for different competing proposals
                        for (const hash of this.proposalsHash) {
                            this.tzscanService.getNbProposalVotes(hash).subscribe(
                                resultproposalNumbers => {
                                    //{"count":57,"votes":11408}
                                    const proposalNumbers: any = resultproposalNumbers;

                                    const proposal = {
                                        hash: hash,
                                        alias: hash,  // /!\ FixMe /!\
                                        count: proposalNumbers.count,
                                        votes: proposalNumbers.votes
                                    };

                                    console.log('proposal ', proposal);
                                    this.currentParticipation.proposal.push(proposal);
                                }
                            );
                        }
                        console.log('currentParticipation.proposal ', this.currentParticipation.proposal);

                        //For other 3 periods (Exploration, Testing, Promotion), to get ballot details (yah, nay or pass)
                        if (this.currentPeriod.period_kind !== 'Proposal') {
                            this.tzscanService.getBallots(this.currentPeriod.period, periodInfo.kind).subscribe(
                                result => {  //{"proposal": "string","nb_yay": 0,"nb_nay": 0,"nb_pass": 0,"vote_yay": 0,"vote_nay": 0,"vote_pass": 0}
                                    const ballotresult: any = result;

                                    this.ballot = {
                                        proposal: ballotresult.proposal,
                                        nb_yay: ballotresult.nb_yay,
                                        nb_nay: ballotresult.nb_nay,
                                        nb_pass: ballotresult.nb_pass,
                                        vote_yay: ballotresult.vote_yay,
                                        vote_nay: ballotresult.vote_nay,
                                        vote_pass: ballotresult.vote_pass
                                    };
                                    this.tzscanService.getTotalVotes2(this.currentPeriod.period).subscribe(
                                        result2 => {
                                            const totalVotes: any = result2;
                                            console.log('totalVotes ' + JSON.stringify(totalVotes));
                                            this.currentParticipation.unused_count = totalVotes.count - (this.ballot.nb_yay + this.ballot.nb_nay + this.ballot.nb_pass);
                                            this.currentParticipation.unused_votes = totalVotes.votes - (this.ballot.vote_yay + this.ballot.vote_nay + this.ballot.vote_pass);
                                            this.currentParticipation.total_count = totalVotes.count;
                                            this.currentParticipation.total_votes = totalVotes.votes;
                                            console.log('currentParticipation ', this.currentParticipation);
                                            //Display Doughnut Charts
                                            this.showDoughnutCharts(this.currentParticipation);
                                        }
                                    );
                                }
                            );
                        }

                        //Getting the totalNumbers
                        if (this.currentPeriod.period_kind === 'Proposal') {
                            this.tzscanService.getTotalVotes(this.currentPeriod.period).subscribe(
                                result => {
                                    const totalVotes: any = result;
                                    this.currentParticipation.unused_count = totalVotes.unused_count;
                                    this.currentParticipation.unused_votes = totalVotes.unused_votes;
                                    this.currentParticipation.total_count = totalVotes.total_count;
                                    this.currentParticipation.total_votes = totalVotes.total_votes;
                                    console.log('currentParticipation ', this.currentParticipation);

                                    //Display Doughnut Charts
                                    this.showDoughnutCharts(this.currentParticipation);
                                }
                            );
                        }
                    }
                );
            }
        );
    }
}
