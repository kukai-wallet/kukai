import { Component, OnInit, OnDestroy } from '@angular/core';
import { Sort } from '@angular/material';

import { WalletService } from '../../services/wallet.service';
import { TzscanService } from '../../services/tzscan.service';
import { OperationService } from '../../services/operation.service';
import { DelegatorNamePipe } from '../../pipes/delegator-name.pipe';

import { Period, PeriodKind } from '../../interfaces';
import { VOTINGPERIODHEADS } from '../../../data/bakers-list';
import { BAKERSLIST } from '../../../data/bakers-list';

@Component({
    selector: 'app-bakers-list',
    templateUrl: './bakers-list.component.html',
    styleUrls: ['./bakers-list.component.scss']
})
export class BakersListComponent implements OnInit, OnDestroy {

    showAll = false;
    bakersList = BAKERSLIST;
    athensAVotes = null;
    athensBVotes = null;
    athensAHash = 'Pt24m4xiPbLDhVgVfABUjirbmda3yohdN82Sp9FeuAXJ4eV9otd';
    athensBHash = 'Psd1ynUBhMZAeajwcZJAeq5NrxorM6UCU4GJqxZ7Bx2e9vUWB6z';
    proposals = null;
    proposalsHash: string[] = [];

    showBtn = 'Show all the bakers';

    showColumn = {
        Proposal: false,
        Exploration: false,
        Testing: false,
        Promotion: false
    };

    currentParticipation = {
        proposal: [],
        unused_count: -1,
        unused_votes: -1,
        total_count: -1,
        total_votes: -1
    };

    votingPeriodHeads = VOTINGPERIODHEADS;
    currentPeriod: Period = {
        amendment: 'Athens',
        period: 10,
        period_kind: 'Proposal', //PeriodKind.Proposal,
        proposal_hash: [],
        proposal_alias: [],
        start_level: this.votingPeriodHeads[0].start_level,  // 327681
        end_level: this.votingPeriodHeads[0].end_level,  // 360448
        level: -1,
        progress: -1,
        remaining: -1
    };

    constructor(
        // Uncaught Error: Can't resolve all parameters for BakersListComponent: ([object Object], [object Object], [object Object], [object Object], ?).
        public walletService: WalletService,
        private tzscanService: TzscanService,
        private delegatorNamePipe: DelegatorNamePipe,
        private operationService: OperationService
    ) { }

    sortData(sort: Sort) {
        const data = this.bakersList.slice();
        if (!sort.active || sort.direction === '') {
          this.bakersList = data;
          return;
        }

        this.bakersList = data.sort((a, b) => {
          const isAsc = sort.direction === 'asc';
          switch (sort.active) {
            case 'name': return compare(a.baker_name, b.baker_name, isAsc);
            case 'roll': return compare(+a.rolls, +b.rolls, isAsc);
            case 'identity': return compare(+a.identity, +b.identity, isAsc);
            case 'proposal': return compare(+a.vote, +b.vote, isAsc);
            case 'exploration': return compare(+a.vote2, +b.vote2, isAsc);
            //case 'testing': return compare(+a.protein, +b.protein, isAsc);
            //case 'promotion': return compare(+a.protein, +b.protein, isAsc);
            default: return 0;
          }
        });

        function compare(a, b, isAsc) {
            return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
        }
    }

    ngOnInit() {  // or ngAfterViewInit  // ngOnInit
        //this.athensAVotes = this.tzscanService.getProposalVotes(this.athensAHash);
        //this.tzscanService.getProposalVotes(this.athensAHash).subscribe(
        this.sortName();
        this.tzscanService.getPeriodInfo().subscribe(
            period => {
                const periodInfo: any = period;
                console.log('getPeriodInfo ', period);
                //Check Voting Period Type
                switch (periodInfo.kind) {
                    case 'proposal': {
                        this.showColumn.Proposal = true;
                        break;
                    }
                    case 'testing_vote': {
                        this.showColumn.Proposal = true;
                        this.showColumn.Exploration = true;
                        break;
                    }
                    case 'testing': {
                        this.showColumn.Proposal = true;
                        this.showColumn.Exploration = true;
                        this.showColumn.Testing = true;
                        break;
                    }
                    case 'promotion': {
                        this.showColumn.Proposal = true;
                        this.showColumn.Exploration = true;
                        this.showColumn.Testing = true;
                        this.showColumn.Promotion = true;
                        break;
                    }
                    default: {
                        console.log('Error with period type');
                        break;
                    }
                }
                this.operationService.getVotingRights().subscribe(
                    ((res: any) => {
                        console.log(res);
                        if (res.success) {
                            for (const voter of res.payload) {
                                // console.log('voter: ' + voter);
                                let known = false;
                                for (const baker of this.bakersList) {
                                    if (baker.identity === voter.pkh) {
                                        baker.rolls = voter.rolls;
                                        known = true;
                                    }
                                } if (!known) { // Add unknown bakers
                                    this.bakersList.push({
                                        baker_name: '',
                                        identity: voter.pkh,
                                        vote: '',
                                        rolls: voter.rolls,
                                        vote2: '',
                                        image: ''
                                   });
                                }
                            }
                            //Getting the totalNumbers
                            this.tzscanService.getTotalVotes(this.currentPeriod.period).subscribe(
                                result => {
                                    const totalVotes: any = result;
                                    this.currentParticipation.unused_count = totalVotes.unused_count;
                                    this.currentParticipation.unused_votes = totalVotes.unused_votes;
                                    this.currentParticipation.total_count = totalVotes.total_count;
                                    this.currentParticipation.total_votes = totalVotes.total_votes;
                                    console.log('currentParticipation ', this.currentParticipation);
                                });
                            this.tzscanService.getProposal().subscribe(
                                data => {
                                    this.proposals = data;
                                    console.log('proposals ', this.proposals);

                                    for (const proposal of this.proposals) {
                                        this.proposalsHash.push(proposal.proposal_hash);
                                        // console.log('proposal.proposal_hash ', proposal.proposal_hash);
                                    }
                                    console.log('proposalsHash ', this.proposalsHash);

                                    /* To replace call made at l132 and l140
                                    //For Proposal Period, to get proposal votes details for each proposal
                                    for (const hash of this.proposalsHash) {
                                        this.tzscanService.getProposalVotes(hash).subscribe(
                                            votes => {
                                                if (this.athensAHash === hash) {
                                                    this.athensAVotes = votes;
                                                } else {
                                                    this.athensBVotes = votes;
                                                }
                                                console.log('athensAVotes ', this.athensAVotes);
                                            }
                                        );
                                    }
                                    console.log('athensAVotes ', this.athensAVotes);  // null
                                    console.log('athensBVotes ', this.athensBVotes);  // null
                                    */
                                    this.tzscanService.getProposalVotes(this.proposalsHash[0]).subscribe(
                                        votesA => {
                                            // console.log('votesA ', votesA);
                                            if (this.athensAHash === this.proposalsHash[0]) {
                                                this.athensAVotes = votesA;
                                            } else {
                                                this.athensBVotes = votesA;
                                            }
                                            this.tzscanService.getProposalVotes(this.proposalsHash[1]).subscribe(
                                                votesB => {
                                                    if (this.athensBHash === this.proposalsHash[1]) {
                                                        this.athensBVotes = votesB;
                                                    } else {
                                                        this.athensAVotes = votesB;
                                                    }
                                                    this.athensBVotes = votesB;
                                                    // console.log('athensAVotes ', this.athensAVotes);
                                                    // console.log('athensBVotes ', this.athensBVotes);

                                                    for (const athensAVote of this.athensAVotes) {
                                                        // console.log('athensAVote.source.tz ', athensAVote.source.tz);
                                                        for (const baker of this.bakersList) {
                                                            if (baker.identity === athensAVote.source.tz) {
                                                                baker.vote = 'Athens A';
                                                            }
                                                        }
                                                    }
                                                    for (const athensBVotes of this.athensBVotes) {
                                                        for (const baker of this.bakersList) {
                                                            if (baker.identity === athensBVotes.source.tz) {
                                                                if (baker.vote !== 'Athens A') {
                                                                    baker.vote = 'Athens B';
                                                                } else {
                                                                    baker.vote = baker.vote.concat('; Athens B');
                                                                }
                                                            }
                                                        }
                                                    }
                                                    // Get number of votes
                                                    if (periodInfo.kind === 'testing_vote') {
                                                        this.tzscanService.getBallotVotes().subscribe(
                                                            (votes: any) => {
                                                                for (const vote of votes) {
                                                                    const index = this.bakersList.findIndex(b => b.identity === vote.type.source.tz);
                                                                    if (index !== -1) {
                                                                        // console.log(JSON.stringify(this.bakersList[index]));
                                                                        if (!this.bakersList[index].vote2) {
                                                                            this.bakersList[index].vote2 = vote.type.ballot;
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        );
                                                    }
                                                }
                                            );
                                        }
                                    );
                                },
                                err => console.log('Failed to get proposal: ' + 'this.athensAHash ' + JSON.stringify(err))
                            );
                        }
                    })
                );
            });
        // console.log('athensAVotes ', this.athensAVotes);  // returning null
    }
    sortRolls() {
        console.log('Sorting on rolls');
        this.bakersList.sort((a, b) => b.rolls - a.rolls);
    }
    sortName() {
        console.log('Sorting on name');
        this.bakersList.sort((a, b) => {
            if (!a.baker_name) { return 1; }
            if (!b.baker_name) { return -1; }
            if (a.baker_name < b.baker_name) { return -1; }
            if (a.baker_name > b.baker_name) { return 1; }
            return 0;
        });
    }
    toggleShowAll() {
        this.showAll = !this.showAll;

        if (this.showAll) {
            this.showBtn = 'Show only Public Bakers';
        } else {
            this.showBtn = 'Show all the Bakers';
        }
    }
    ngOnDestroy() {
        this.bakersList = [];
    }
}
