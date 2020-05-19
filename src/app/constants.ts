interface Net {
    NAME: string;
    NETWORK: string;
    CSI: { // Conseil Server Info
        url: string;
        apiKey: string;
    };
    NODE_URL: string;
    BLOCK_EXPLORER_URL: string;
}
export class Constants {
    // Select Testnet or Mainnet
    readonly NET: Net = this.carthagenet();

    private mainnet(): Net {
        return {
            NAME: 'Mainnet',
            NETWORK: 'mainnet',
            CSI: {
                url: 'https://conseil-prod.cryptonomic-infra.tech',
                apiKey: 'klassare'
            },
            NODE_URL: 'https://mainnet-tezos.giganode.io',
            BLOCK_EXPLORER_URL: 'https://tzkt.io'
        };
    }
    private carthagenet(): Net {
        return {
            NAME: 'Testnet / Carthage',
            NETWORK: 'carthagenet',
            CSI: {
                url: 'https://conseil-dev.cryptonomic-infra.tech',
                apiKey: 'klassare'
            },
            NODE_URL: 'https://testnet-tezos.giganode.io',
            BLOCK_EXPLORER_URL: 'https://carthage.tzkt.io'
        };
    }
}
