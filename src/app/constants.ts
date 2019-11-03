interface Net {
    NAME: string;
    CSI?: any;
    NODE_URL: string;
    BLOCK_EXPLORER_URL: string;
    CHAIN_ID: string;
}
export class Constants {
    // Select Testnet or Mainnet
    // readonly NET: Net = this.testnet();
    readonly NET: Net = this.mainnet();

    testnet(): Net {
        const TESTNET: Net = {
            NAME: 'Testnet',
            CSI: {
                url: 'https://conseil-dev.cryptonomic-infra.tech',
                apiKey: 'klassare'
            },
            NODE_URL: 'https://rpcalpha.tzbeta.net',
            BLOCK_EXPLORER_URL: 'https://mvp.tezblock.io',
            CHAIN_ID: 'PsBabyM1eUXZseaJdmXFApDSBqj8YBfwELoxZHHW77EMcAbbwAS'
        };
        return TESTNET;
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
