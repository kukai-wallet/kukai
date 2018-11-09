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
    // readonly NET: Net = this.mainnet();

    zeronet(): Net {
        const ZERONET: Net = {
            NAME:  'Zeronet',
            API_URL:  'https://zeronet-api.tzscan.io/',
            NODE_URL: 'https://zeronet-node.tzscan.io/',
            BLOCK_EXPLORER_URL: 'https://zeronet.tzscan.io/',
            CHAIN_ID: 'ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK'
        };
        return ZERONET;
    }
    alphanet(): Net {
        const ALPHANET: Net = {
            NAME:  'Alphanet',
            API_URL:  'https://alphanet-api.tzscan.io/',
            NODE_URL: 'https://alphanet-node.tzscan.io/',
            BLOCK_EXPLORER_URL: 'https://alphanet.tzscan.io/',
            CHAIN_ID: 'PsYLVpVvgbLhAhoqAkMFUo6gudkJ9weNXhUYCiLDzcUpFpkk8Wt'
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
            CHAIN_ID: 'PsYLVpVvgbLhAhoqAkMFUo6gudkJ9weNXhUYCiLDzcUpFpkk8Wt'
        };
        return MAINNET;
    }
}
