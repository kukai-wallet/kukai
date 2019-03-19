import { Component, OnInit, OnDestroy } from '@angular/core';

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

    bakersList = BAKERSLIST;
    athensAVotes = null;
    athensBVotes = null;
    athensAHash = 'Pt24m4xiPbLDhVgVfABUjirbmda3yohdN82Sp9FeuAXJ4eV9otd';
    athensBHash = 'Psd1ynUBhMZAeajwcZJAeq5NrxorM6UCU4GJqxZ7Bx2e9vUWB6z';
    proposals = null;
    proposalsHash: string[] = [];

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
        public walletService: WalletService,
        private tzscanService: TzscanService,
        private delegatorNamePipe: DelegatorNamePipe,
        private operationService: OperationService
    ) { }

    ngOnInit() {  // or ngAfterViewInit  // ngOnInit
        //this.athensAVotes = this.tzscanService.getProposalVotes(this.athensAHash);
        //this.tzscanService.getProposalVotes(this.athensAHash).subscribe(

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
                    case 'exploration': {
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
                                                    if ( baker.vote !== 'Athens A' ) {
                                                        baker.vote = 'Athens B';
                                                    } else {
                                                        baker.vote = baker.vote.concat( '; Athens B' );
                                                    }
                                                }
                                            }
                                        }
                                        // Get number of votes
                                        this.operationService.getVotingRights().subscribe(
                                            ((res: any) => {
                                                console.log(res);
                                                if (res.success) {
                                                    for (const voter of res.payload) {
                                                        console.log('voter: ' + voter);
                                                        for (const baker of this.bakersList) {
                                                            if (baker.identity === voter.pkh) {
                                                                baker.rolls = voter.rolls;
                                                            }
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
                                                }
                                            })
                                        );
                                    }
                                );
                            }
                        );
                    },
                    err => console.log('Failed to get proposal: ' + 'this.athensAHash ' + JSON.stringify(err))
                );
            });
            // console.log('athensAVotes ', this.athensAVotes);  // returning null
    }

    ngOnDestroy() {
        this.bakersList = [];
    }
}
