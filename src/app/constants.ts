interface Net {
    NAME:  string;
    API_URL:  string;
    NODE_URL: string;
    BLOCK_EXPLORER_URL: string;
    CHAIN_ID: string;
  }
export class Constants {
    // Select Betanet or Zeronet
    readonly NET: Net = this.betanet();
    // readonly NET: Net = this.zeronet();

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
    betanet(): Net {
        const BETANET: Net = {
            NAME:  'Betanet',
            API_URL:  'https://api.tzscan.io/',
            NODE_URL: 'https://rpc.tezrpc.me/',
            BLOCK_EXPLORER_URL: 'https://tzscan.io/',
            CHAIN_ID: 'PsYLVpVvgbLhAhoqAkMFUo6gudkJ9weNXhUYCiLDzcUpFpkk8Wt'
        };
        return BETANET;
    }
}
