// https://api.better-call.dev/v1/contract/delphinet/KT1RhzBigSQWQkEZQpNSyi4abTFm5fpMyihH/storage
export const storageMock = `{
  "prim": "pair",
  "type": "namedtuple",
  "children": [
    {
      "prim": "pair",
      "type": "namedtuple",
      "name": "admin",
      "children": [
        {
          "prim": "address",
          "type": "address",
          "name": "admin",
          "value": "tz1UTCnwfz6axmJYCZzrWrdmyuw9ctKtEakZ"
        },
        {
          "prim": "big_map",
          "type": "big_map",
          "name": "metadata",
          "value": 26006
        },
        {
          "prim": "bool",
          "type": "bool",
          "name": "paused",
          "value": false
        },
        {
          "name": "pending_admin"
        }
      ]
    },
    {
      "prim": "pair",
      "type": "namedtuple",
      "name": "assets",
      "children": [
        {
          "prim": "big_map",
          "type": "big_map",
          "name": "ledger",
          "value": 26007
        },
        {
          "prim": "nat",
          "type": "nat",
          "name": "next_token_id",
          "value": "1"
        },
        {
          "prim": "big_map",
          "type": "big_map",
          "name": "operators",
          "value": 26008
        },
        {
          "prim": "pair",
          "type": "namedtuple",
          "name": "permissions_descriptor",
          "children": [
            {
              "prim": "or",
              "type": "namedenum",
              "name": "operator",
              "value": "owner_or_operator_transfer"
            },
            {
              "prim": "or",
              "type": "namedenum",
              "name": "receiver",
              "value": "optional_owner_hook"
            },
            {
              "prim": "or",
              "type": "namedenum",
              "name": "sender",
              "value": "optional_owner_hook"
            },
            {
              "name": "custom"
            }
          ]
        },
        {
          "prim": "big_map",
          "type": "big_map",
          "name": "token_metadata",
          "value": 26009
        }
      ]
    }
  ]
}`;
// https://api.better-call.dev/v1/bigmap/delphinet/26009/keys
export const tokenMetadataBigMapMock = `[
  {
    "data": {
      "key": {
        "prim": "nat",
        "type": "nat",
        "value": "0"
      },
      "value": {
        "prim": "pair",
        "type": "namedtuple",
        "children": [
          {
            "prim": "nat",
            "type": "nat",
            "name": "token_id",
            "value": "0"
          },
          {
            "prim": "map",
            "type": "map",
            "name": "token_metadata_map",
            "children": [
              {
                "prim": "bytes",
                "type": "bytes",
                "value": "ipfs://QmZDycNwSy12vueaPnxuCMFUCHeQieT5wA5yNwqswwFn3V"
              }
            ]
          }
        ]
      },
      "key_hash": "exprtZBwZUeYYYfUs9B9Rg2ywHezVHnCCnmF9WsDQVrs582dSK63dC",
      "key_string": "0",
      "level": 270786,
      "timestamp": "2020-12-13T09:56:12Z"
    },
    "count": 1
  }
]`;
// https://api.better-call.dev/v1/bigmap/delphinet/26006/keys
export const contractMetadataBigMapMock = `[
  {
    "data": {
      "key": {
        "prim": "string",
        "type": "string",
        "value": ""
      },
      "value": {
        "prim": "bytes",
        "type": "bytes",
        "value": "ipfs://QmVBdYhUXmF3QSRSYgoZfvUhLKgW4oCWC6xMzvHzV5TFVA"
      },
      "key_hash": "expru5X1yxJG6ezR2uHMotwMLNmSzQyh5t1vUnhjx4cS6Pv9qE1Sdo",
      "key_string": "",
      "level": 270780,
      "timestamp": "2020-12-13T09:53:12Z"
    },
    "count": 1
  }
]`;
// https://cloudflare-ipfs.com/ipfs/QmZDycNwSy12vueaPnxuCMFUCHeQieT5wA5yNwqswwFn3V
export const tokenIpfsMock = `{
  "name": "Klassare Alpha Brain",
  "symbol": "TZBKAB",
  "decimals": "0",
  "description": "An upgraded unit, the great Klassare reborn.",
  "isTransferable": true,
  "isBooleanAmount": true,
  "displayUri": "https://gateway.pinata.cloud/ipfs/QmZjeBZT5QykT4sEELYP2cYYEPTtgwx3vQhnyMzCmDKB7Q",
  "defaultPresentation": "small",
  "actionLabel": "Send",
  "shouldPreferSymbol": true
}`;
// https://cloudflare-ipfs.com/ipfs/QmVBdYhUXmF3QSRSYgoZfvUhLKgW4oCWC6xMzvHzV5TFVA
export const contractIpfsMock = `{
  "name": "Tezible NFT",
  "description": "Multi NFT Asset with mint using latest metadata standard.",
  "version": "0.1.0",
  "license": {
    "name": "MIT",
    "details": "MIT License"
  },
  "interfaces": [
    "TZIP-12",
    "TZIP-16",
    "TZIP-20"
  ],
  "authors": [
    "tezit"
  ],
  "tokenCategory": "collectibles",
  "pictures": [
    {
      "link": "https://gateway.pinata.cloud/ipfs/QmPfMe4BWadWGhwsfMi2rwykmeZiyH7Cy7Dr55CdVLxyWD",
      "type": "cover"
    },
    {
      "link": "https://gateway.pinata.cloud/ipfs/QmPfMe4BWadWGhwsfMi2rwykmeZiyH7Cy7Dr55CdVLxyWD",
      "type": "logo"
    }
  ],
  "events": [
    {
      "_name": "handle_nft_mint",
      "name": "multi-asset-balance-updates",
      "implementations": [
        {
          "michelson-extended-storage-event": {
            "parameter": {
              "prim": "pair",
              "args": [
                {
                  "prim": "pair",
                  "annots": [
                    "%admin"
                  ],
                  "args": [
                    {
                      "prim": "pair",
                      "args": [
                        {
                          "prim": "address",
                          "annots": [
                            "%admin"
                          ]
                        },
                        {
                          "prim": "map",
                          "annots": [
                            "%metadata"
                          ],
                          "args": [
                            {
                              "prim": "string"
                            },
                            {
                              "prim": "string"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "prim": "pair",
                      "args": [
                        {
                          "prim": "bool",
                          "annots": [
                            "%paused"
                          ]
                        },
                        {
                          "prim": "option",
                          "annots": [
                            "%pending_admin"
                          ],
                          "args": [
                            {
                              "prim": "address"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  "prim": "pair",
                  "annots": [
                    "%assets"
                  ],
                  "args": [
                    {
                      "prim": "pair",
                      "args": [
                        {
                          "prim": "pair",
                          "args": [
                            {
                              "prim": "map",
                              "annots": [
                                "%ledger"
                              ],
                              "args": [
                                {
                                  "prim": "nat"
                                },
                                {
                                  "prim": "address"
                                }
                              ]
                            },
                            {
                              "prim": "nat",
                              "annots": [
                                "%next_token_id"
                              ]
                            }
                          ]
                        },
                        {
                          "prim": "pair",
                          "args": [
                            {
                              "prim": "map",
                              "annots": [
                                "%operators"
                              ],
                              "args": [
                                {
                                  "prim": "pair",
                                  "args": [
                                    {
                                      "prim": "address"
                                    },
                                    {
                                      "prim": "pair",
                                      "args": [
                                        {
                                          "prim": "address"
                                        },
                                        {
                                          "prim": "nat"
                                        }
                                      ]
                                    }
                                  ]
                                },
                                {
                                  "prim": "unit"
                                }
                              ]
                            },
                            {
                              "prim": "pair",
                              "annots": [
                                "%permissions_descriptor"
                              ],
                              "args": [
                                {
                                  "prim": "or",
                                  "annots": [
                                    "%operator"
                                  ],
                                  "args": [
                                    {
                                      "prim": "unit",
                                      "annots": [
                                        "%no_transfer"
                                      ]
                                    },
                                    {
                                      "prim": "or",
                                      "args": [
                                        {
                                          "prim": "unit",
                                          "annots": [
                                            "%owner_transfer"
                                          ]
                                        },
                                        {
                                          "prim": "unit",
                                          "annots": [
                                            "%owner_or_operator_transfer"
                                          ]
                                        }
                                      ]
                                    }
                                  ]
                                },
                                {
                                  "prim": "pair",
                                  "args": [
                                    {
                                      "prim": "or",
                                      "annots": [
                                        "%receiver"
                                      ],
                                      "args": [
                                        {
                                          "prim": "unit",
                                          "annots": [
                                            "%owner_no_hook"
                                          ]
                                        },
                                        {
                                          "prim": "or",
                                          "args": [
                                            {
                                              "prim": "unit",
                                              "annots": [
                                                "%optional_owner_hook"
                                              ]
                                            },
                                            {
                                              "prim": "unit",
                                              "annots": [
                                                "%required_owner_hook"
                                              ]
                                            }
                                          ]
                                        }
                                      ]
                                    },
                                    {
                                      "prim": "pair",
                                      "args": [
                                        {
                                          "prim": "or",
                                          "annots": [
                                            "%sender"
                                          ],
                                          "args": [
                                            {
                                              "prim": "unit",
                                              "annots": [
                                                "%owner_no_hook"
                                              ]
                                            },
                                            {
                                              "prim": "or",
                                              "args": [
                                                {
                                                  "prim": "unit",
                                                  "annots": [
                                                    "%optional_owner_hook"
                                                  ]
                                                },
                                                {
                                                  "prim": "unit",
                                                  "annots": [
                                                    "%required_owner_hook"
                                                  ]
                                                }
                                              ]
                                            }
                                          ]
                                        },
                                        {
                                          "prim": "option",
                                          "annots": [
                                            "%custom"
                                          ],
                                          "args": [
                                            {
                                              "prim": "pair",
                                              "args": [
                                                {
                                                  "prim": "string",
                                                  "annots": [
                                                    "%tag"
                                                  ]
                                                },
                                                {
                                                  "prim": "option",
                                                  "annots": [
                                                    "%config_api"
                                                  ],
                                                  "args": [
                                                    {
                                                      "prim": "address"
                                                    }
                                                  ]
                                                }
                                              ]
                                            }
                                          ]
                                        }
                                      ]
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "prim": "map",
                      "annots": [
                        "%token_metadata"
                      ],
                      "args": [
                        {
                          "prim": "nat"
                        },
                        {
                          "prim": "string"
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            "return-type": {
              "prim": "map",
              "args": [
                {
                  "prim": "pair",
                  "args": [
                    {
                      "prim": "address"
                    },
                    {
                      "prim": "nat"
                    }
                  ]
                },
                {
                  "prim": "int"
                }
              ]
            },
            "code": [
              {
                "prim": "DUP"
              },
              {
                "prim": "CDR"
              },
              {
                "prim": "SWAP"
              },
              {
                "prim": "CAR"
              },
              {
                "prim": "CDR"
              },
              {
                "prim": "CAR"
              },
              {
                "prim": "CAR"
              },
              {
                "prim": "CAR"
              },
              {
                "prim": "ITER",
                "args": [
                  [
                    {
                      "prim": "SWAP"
                    },
                    {
                      "prim": "PUSH",
                      "args": [
                        {
                          "prim": "int"
                        },
                        {
                          "int": "1"
                        }
                      ]
                    },
                    {
                      "prim": "SOME"
                    },
                    {
                      "prim": "DIG",
                      "args": [
                        {
                          "int": "2"
                        }
                      ]
                    },
                    {
                      "prim": "DUP"
                    },
                    {
                      "prim": "DUG",
                      "args": [
                        {
                          "int": "3"
                        }
                      ]
                    },
                    {
                      "prim": "CAR"
                    },
                    {
                      "prim": "DIG",
                      "args": [
                        {
                          "int": "3"
                        }
                      ]
                    },
                    {
                      "prim": "CDR"
                    },
                    {
                      "prim": "PAIR"
                    },
                    {
                      "prim": "UPDATE"
                    }
                  ]
                ]
              },
              {
                "prim": "NIL",
                "args": [
                  {
                    "prim": "operation"
                  }
                ]
              },
              {
                "prim": "PAIR"
              }
            ]
          }
        }
      ]
    }
  ]
}`;
export const expectedResult: any = {
  symbol: 'TZBKAB',
  name: 'Klassare Alpha Brain',
  description: 'An upgraded unit, the great Klassare reborn.',
  decimals: 0,
  tokenType: 'FA2', // tzip-12
  tokenCategory: 'collectibles',
  displayUri: 'https://gateway.pinata.cloud/ipfs/QmZjeBZT5QykT4sEELYP2cYYEPTtgwx3vQhnyMzCmDKB7Q',
  isTransferable: true,
  isBooleanAmount: true,
  shouldPreferSymbol: true
};
