interface Net {
    NAME: string;
    CSI?: any;
    NODE_URL: string;
    BLOCK_EXPLORER_URL: string;
    CHAIN_ID: string;
}
export class Constants {
    // Select Zeronet, Alphanet or Mainnet
    // readonly NET: Net = this.alphanet();
    // readonly NET: Net = this.zeronet();
    readonly NET: Net = this.mainnet();

    zeronet(): Net {
        const ZERONET: Net = {
            NAME: 'Zeronet',
            CSI: {
                url: 'https://conseil-staging2.cryptonomic-infra.tech',
                apiKey: 'klassare'
            },
            NODE_URL: 'https://zeronet-node.tzscan.io/',
            BLOCK_EXPLORER_URL: 'https://zeronet.tzscan.io/',
            CHAIN_ID: 'PsBABY5HQTSkA4297zNHfsZNKtxULfL18y95qb3m53QJiXGmrbU'
        };
        return ZERONET;
    }
    alphanet(): Net {
        const ALPHANET: Net = {
            NAME: 'Alphanet',
            NODE_URL: 'https://rpcalpha.tzbeta.net',
            BLOCK_EXPLORER_URL: 'https://alphanet.tzscan.io/',
            CHAIN_ID: 'Pt24m4xiPbLDhVgVfABUjirbmda3yohdN82Sp9FeuAXJ4eV9otd'
        };
        return ALPHANET;
    }
    mainnet(): Net {
        const MAINNET: Net = {
            NAME: 'Mainnet',
            CSI: {
                url: 'https://conseil-prod.cryptonomic-infra.tech',
                apiKey: 'klassare'
            },
            NODE_URL: 'https://rpc.tzbeta.net',
            BLOCK_EXPLORER_URL: 'https://mvp.tezblock.io',
            CHAIN_ID: 'PsBabyM1eUXZseaJdmXFApDSBqj8YBfwELoxZHHW77EMcAbbwAS'
        };
        return MAINNET;
    }
}
