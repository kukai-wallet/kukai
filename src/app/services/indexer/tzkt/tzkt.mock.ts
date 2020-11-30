export const storageMock: string = `{
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
          "value": "tz1MY7TveRsWswiAtVxuDv1hMmwd7za2g3zz"
        },
        {
          "prim": "big_map",
          "type": "big_map",
          "name": "metadata",
          "value": 31948
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
          "value": 31949
        },
        {
          "prim": "nat",
          "type": "nat",
          "name": "next_token_id",
          "value": "2"
        },
        {
          "prim": "big_map",
          "type": "big_map",
          "name": "operators",
          "value": 31950
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
          "value": 31951
        }
      ]
    }
  ]
}`;
export const bigMapMock: string = `[
  {
    "data": {
      "key": {
        "prim": "nat",
        "type": "nat",
        "value": "2"
      },
      "value": {
        "prim": "pair",
        "type": "namedtuple",
        "children": [
          {
            "prim": "nat",
            "type": "nat",
            "name": "token_id",
            "value": "2"
          },
          {
            "prim": "string",
            "type": "string",
            "name": "symbol",
            "value": "TBBST"
          },
          {
            "prim": "string",
            "type": "string",
            "name": "name",
            "value": "BlueStar"
          },
          {
            "prim": "nat",
            "type": "nat",
            "name": "decimals",
            "value": "0"
          },
          {
            "prim": "map",
            "type": "map",
            "name": "extras",
            "children": [
              {
                "prim": "bytes",
                "type": "bytes",
                "name": "uri",
                "value": "ipfs://QmZ5jRzHSeCYbyArRsPy7sQBZEroQ3xMhdZSMt4uqhsRGA"
              }
            ]
          }
        ]
      },
      "key_hash": "expruDuAZnFKqmLoisJqUGqrNzXTvw7PJM2rYk97JErM5FHCerQqgn",
      "key_string": "2",
      "level": 892502,
      "timestamp": "2020-11-30T06:40:19Z"
    },
    "count": 1
  },
  {
    "data": {
      "key": {
        "prim": "nat",
        "type": "nat",
        "value": "1"
      },
      "value": {
        "prim": "pair",
        "type": "namedtuple",
        "children": [
          {
            "prim": "nat",
            "type": "nat",
            "name": "token_id",
            "value": "1"
          },
          {
            "prim": "string",
            "type": "string",
            "name": "symbol",
            "value": "TBKKL"
          },
          {
            "prim": "string",
            "type": "string",
            "name": "name",
            "value": "Kukai Lanterns"
          },
          {
            "prim": "nat",
            "type": "nat",
            "name": "decimals",
            "value": "0"
          },
          {
            "prim": "map",
            "type": "map",
            "name": "extras",
            "children": [
              {
                "prim": "bytes",
                "type": "bytes",
                "name": "uri",
                "value": "ipfs://QmPx4WPZjg1fmVtWtEUoCGVwyeX3pikSCNKEjPbbHdxcnF"
              }
            ]
          }
        ]
      },
      "key_hash": "expru2dKqDfZG8hu4wNGkiyunvq2hdSKuVYtcKta7BWP6Q18oNxKjS",
      "key_string": "1",
      "level": 891514,
      "timestamp": "2020-11-29T10:02:17Z"
    },
    "count": 1
  },
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
            "prim": "string",
            "type": "string",
            "name": "symbol",
            "value": "TBSTS"
          },
          {
            "prim": "string",
            "type": "string",
            "name": "name",
            "value": "Star Token"
          },
          {
            "prim": "nat",
            "type": "nat",
            "name": "decimals",
            "value": "0"
          },
          {
            "prim": "map",
            "type": "map",
            "name": "extras",
            "children": [
              {
                "prim": "bytes",
                "type": "bytes",
                "name": "uri",
                "value": "ipfs://QmQsx6PauxbAfC7uo97Mg8BBuLdfsB6auojtxLr4yGSuyY"
              }
            ]
          }
        ]
      },
      "key_hash": "exprtZBwZUeYYYfUs9B9Rg2ywHezVHnCCnmF9WsDQVrs582dSK63dC",
      "key_string": "0",
      "level": 891471,
      "timestamp": "2020-11-29T09:09:39Z"
    },
    "count": 1
  }
]`;
export const bigMapMock2: string = `[
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
        "value": "ipfs://QmZQck9Akebnabp58YJukBMEUg5fjZLfrV2DqnPNYpQPJJ"
      },
      "key_hash": "expru5X1yxJG6ezR2uHMotwMLNmSzQyh5t1vUnhjx4cS6Pv9qE1Sdo",
      "key_string": "",
      "level": 891469,
      "timestamp": "2020-11-29T09:07:33Z"
    },
    "count": 1
  }
]`;
export const ipfsMock: string = `{
  "name": "BlueStar",
  "symbol": "TBBST",
  "description": "A fantastic blue star for you.",
  "isNft": true,
  "imageUri": "https://gateway.pinata.cloud/ipfs/QmNrZ8uHokqjtkD2EXBLwzPZkvpK4ireaHoDTEykeVFZgu",
  "defaultPresentation": "large",
  "actionLabel": "Send"
}`;
export const ipfsMock2: string = `{
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
  "token-category": "collectibles",
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
  ],
  "tokens": {
    "dynamic": [
      {
        "big_map": "token_metadata"
      }
    ]
  }
}`;
export const expectedResult: any = {
  symbol: 'TBBST',
  name: 'BlueStar',
  description: 'A fantastic blue star for you.',
  decimals: 0,
  tokenType: 'FA2',// tzip-12
  imageUri: 'https://gateway.pinata.cloud/ipfs/QmNrZ8uHokqjtkD2EXBLwzPZkvpK4ireaHoDTEykeVFZgu',
  isNft: true
}