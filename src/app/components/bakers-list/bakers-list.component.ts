import { Component, OnInit, OnDestroy } from '@angular/core';

import { WalletService } from '../../services/wallet.service';
import { TzscanService } from '../../services/tzscan.service';
import { DelegatorNamePipe } from '../../pipes/delegator-name.pipe';

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

    constructor(
        public walletService: WalletService,
        private tzscanService: TzscanService,
        private delegatorNamePipe: DelegatorNamePipe
    ) { }

    ngOnInit() {  // or ngAfterViewInit  // ngOnInit
        //this.athensAVotes = this.tzscanService.getProposalVotes(this.athensAHash);
        //this.tzscanService.getProposalVotes(this.athensAHash).subscribe(
        this.tzscanService.getProposal().subscribe(
            data => {
                this.proposals = data;
                console.log('proposals ', this.proposals);

                for (const proposal of this.proposals) {
                    this.proposalsHash.push(proposal.proposal_hash);
                    // console.log('proposal.proposal_hash ', proposal.proposal_hash);
                }
                console.log('proposalsHash ', this.proposalsHash);
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
                                console.log('athensAVotes ', this.athensAVotes);
                                console.log('athensBVotes ', this.athensBVotes);

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

                            }
                        );
                    }
                );
            },
            err => console.log('Failed to get proposal: ' + 'this.athensAHash ' + JSON.stringify(err))
          );
        // console.log('athensAVotes ', this.athensAVotes);  // returning null
    }

    ngOnDestroy() {
        this.bakersList = [];
    }
}
