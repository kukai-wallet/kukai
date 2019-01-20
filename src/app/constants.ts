interface Net {
    NAME:  string;
    API_URL:  string;
    NODE_URL: string;
    BLOCK_EXPLORER_URL: string;
    CHAIN_ID: string;
  }
export class Constants {
    // Select Zeronet, Alphanet or Mainnet
    readonly NET: Net = this.alphanet();
    // readonly NET: Net = this.zeronet();
    // readonly NET: Net = this.mainnet();

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
        const n = Math.floor(Math.random() * 6) + 1;
        const MAINNET: Net = {
            NAME:  'Mainnet',
            API_URL:  'https://api' + n + '.tzscan.io/',
            NODE_URL: 'https://rpc.tezrpc.me/',
            BLOCK_EXPLORER_URL: 'https://tzscan.io/',
            CHAIN_ID: 'PsddFKi32cMJ2qPjf43Qv5GDWLDPZb3T3bF6fLKiF5HtvHNU7aP'
        };
        return MAINNET;
    }
}
