interface Net {
    NAME:  string;
    API_URL:  string;
    NODE_URL: string;
    BLOCK_EXPLORER_URL: string;
    CHAIN_ID: string;
  }

export const VOTINGPERIOD: any = {
    cycles: 8,
    blocks: 32768
};

export const PROPOSALHASH: any = {
    athensAHash: 'Pt24m4xiPbLDhVgVfABUjirbmda3yohdN82Sp9FeuAXJ4eV9otd',
    athensBHash: 'Psd1ynUBhMZAeajwcZJAeq5NrxorM6UCU4GJqxZ7Bx2e9vUWB6z',
};
export const PROPOSALS: any = [
    {
        hash: PROPOSALHASH.athensAHash,
        alias: 'Athens A'
    },
    {
        hash: PROPOSALHASH.athensBHash,
        alias: 'Athens B'
    }
];
export class Constants {
    // Select Zeronet, Alphanet or Mainnet
    // readonly NET: Net = this.alphanet();
    // readonly NET: Net = this.zeronet();
    readonly NET: Net = this.mainnet();

    zeronet(): Net {
        const ZERONET: Net = {
            NAME:  'Zeronet',
            API_URL:  'https://api.zeronet.tzscan.io/',
            NODE_URL: 'https://zeronet-node.tzscan.io/',
            BLOCK_EXPLORER_URL: 'https://zeronet.tzscan.io/',
            CHAIN_ID: 'ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK'
        };
        return ZERONET;
    }
    alphanet(): Net {
        const ALPHANET: Net = {
            NAME:  'Alphanet',
            API_URL:  'https://api.alphanet.tzscan.io/',
            NODE_URL: 'https://alphanet-node.tzscan.io/',
            BLOCK_EXPLORER_URL: 'https://alphanet.tzscan.io/',
            CHAIN_ID: 'PsddFKi32cMJ2qPjf43Qv5GDWLDPZb3T3bF6fLKiF5HtvHNU7aP'
        };
        return ALPHANET;
    }
    mainnet(): Net {
        let n = Math.floor(Math.random() * 5) + 1;
        if (n > 3) { n += 1; }
        const MAINNET: Net = {
            NAME:  'Mainnet',
            API_URL:  'https://api' + n + '.tzscan.io/',
            NODE_URL: 'https://rpc.tezrpc.me/',
            BLOCK_EXPLORER_URL: 'https://tzscan.io/',
            CHAIN_ID: 'Pt24m4xiPbLDhVgVfABUjirbmda3yohdN82Sp9FeuAXJ4eV9otd'
        };
        return MAINNET;
    }
}
