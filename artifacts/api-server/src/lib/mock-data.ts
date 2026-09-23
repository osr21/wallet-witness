// Realistic mock data for when NANSEN_API_KEY is not configured
// Based on real Nansen API response shapes

export const MOCK_CASES = [
  {
    title: "The Tactician",
    description:
      "A methodical operator who moves quietly through DeFi markets, leaving precise footprints. Their timing is impeccable — but why?",
    walletAddress: "0x3DdfA8eC3052539b6C9549F12cEA2C295cfF5296",
    chain: "ethereum",
    walletType: "smart_money",
    difficulty: "medium",
    narrative:
      "Subject 001 has been active since mid-2021. Wallet activity peaks around protocol launches and governance votes. Movements are deliberate, never impulsive. The question is: who taught them to read the chain like this?",
  },
  {
    title: "Deep Waters",
    description:
      "Massive. Ancient. Immovable. This wallet has barely breathed in years — yet when it does, markets notice.",
    walletAddress: "0x28C6c06298d514Db089934071355E5743bf21d60",
    chain: "ethereum",
    walletType: "whale",
    difficulty: "easy",
    narrative:
      "Subject 002 has not interacted with a DEX in over 14 months. The balances are staggering. The related wallets tell a story of institutional control. Something this big does not move without a reason.",
  },
  {
    title: "The Scatter",
    description:
      "Constantly active, rarely profitable. This wallet chases every trend — but always seems to be a few minutes late.",
    walletAddress: "0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43",
    chain: "ethereum",
    walletType: "retail",
    difficulty: "hard",
    narrative:
      "Subject 003 has executed over 300 trades in 6 months. They bought PEPE at the top, sold ARB too early, and bridged to three chains in one day chasing an airdrop. Sound familiar?",
  },
];

export const CLUE_CONFIGS = [
  {
    clueType: "balance",
    title: "Evidence File: Current Holdings",
    nansenEndpoint: "address/current-balance",
    hint: "Examine the portfolio composition. What is this wallet actually holding — and how much?",
  },
  {
    clueType: "pnl_summary",
    title: "Evidence File: Profit & Loss",
    nansenEndpoint: "profiler/address/pnl-summary",
    hint: "Look at the win rate and total realized profit. Does this wallet make money?",
  },
  {
    clueType: "pnl",
    title: "Evidence File: Trade Performance",
    nansenEndpoint: "profiler/address/pnl",
    hint: "Which tokens did they trade and what was the outcome? Look for patterns.",
  },
  {
    clueType: "transactions",
    title: "Evidence File: On-Chain Footprint",
    nansenEndpoint: "profiler/address/transactions",
    hint: "How active is this wallet? What types of transactions does it make?",
  },
  {
    clueType: "dex_trades",
    title: "Evidence File: DEX Behavior",
    nansenEndpoint: "profiler/dex-trades",
    hint: "How does this wallet trade on decentralized exchanges? Size, frequency, timing.",
  },
  {
    clueType: "related_wallets",
    title: "Evidence File: The Network",
    nansenEndpoint: "profiler/address/related-wallets",
    hint: "Who does this wallet talk to? Related wallets reveal identity.",
  },
];

// Mock data keyed by walletType + clueType
export function getMockClueData(
  walletType: string,
  clueType: string,
): Record<string, unknown> {
  return MOCK_DATA[walletType]?.[clueType] ?? {};
}

const MOCK_DATA: Record<string, Record<string, unknown>> = {
  smart_money: {
    balance: {
      total_value_usd: 847_320.45,
      data: [
        {
          token_symbol: "ETH",
          token_address: "0x0000000000000000000000000000000000000000",
          balance: "234.8",
          value_usd: 426_334.4,
          chain: "ethereum",
        },
        {
          token_symbol: "ARB",
          token_address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
          balance: "145000",
          value_usd: 168_200,
          chain: "ethereum",
        },
        {
          token_symbol: "OP",
          token_address: "0x4200000000000000000000000000000000000042",
          balance: "87000",
          value_usd: 122_460,
          chain: "ethereum",
        },
        {
          token_symbol: "USDC",
          token_address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          balance: "130_326",
          value_usd: 130_326,
          chain: "ethereum",
        },
      ],
    },
    pnl_summary: {
      winrate: 0.73,
      realized_pnl_usd: 312_456.78,
      unrealized_pnl_usd: 89_200,
      total_trades: 89,
      best_trade_usd: 94_500,
      worst_trade_usd: -8_200,
      average_holding_days: 22.4,
    },
    pnl: {
      data: [
        {
          token_symbol: "ARB",
          buy_usd: 18_000,
          sell_usd: 112_500,
          realized_pnl: 94_500,
          first_trade: "2023-03-23",
          last_trade: "2023-06-15",
        },
        {
          token_symbol: "OP",
          buy_usd: 24_000,
          sell_usd: 67_000,
          realized_pnl: 43_000,
          first_trade: "2023-05-10",
          last_trade: "2023-08-22",
        },
        {
          token_symbol: "LDO",
          buy_usd: 35_000,
          sell_usd: 89_000,
          realized_pnl: 54_000,
          first_trade: "2023-01-15",
          last_trade: "2023-04-02",
        },
        {
          token_symbol: "GMX",
          buy_usd: 45_000,
          sell_usd: 36_800,
          realized_pnl: -8_200,
          first_trade: "2023-09-01",
          last_trade: "2023-10-14",
        },
      ],
    },
    transactions: {
      total_count: 234,
      recent: [
        {
          tx_hash: "0xabcdef1234...",
          timestamp: "2024-09-20T14:30:00Z",
          type: "swap",
          value_usd: 45_000,
          protocol: "Uniswap V3",
        },
        {
          tx_hash: "0x9876543abc...",
          timestamp: "2024-09-18T09:15:00Z",
          type: "stake",
          value_usd: 28_000,
          protocol: "Lido",
        },
        {
          tx_hash: "0xfedcba9876...",
          timestamp: "2024-09-12T22:45:00Z",
          type: "bridge",
          value_usd: 150_000,
          protocol: "Stargate",
        },
      ],
    },
    dex_trades: {
      data: [
        {
          timestamp: "2024-09-20T14:30:00Z",
          token_in: "USDC",
          token_out: "ARB",
          amount_in_usd: 45_000,
          amount_out_usd: 44_800,
          dex: "Uniswap V3",
          price_impact: 0.004,
        },
        {
          timestamp: "2024-09-10T08:20:00Z",
          token_in: "ETH",
          token_out: "OP",
          amount_in_usd: 120_000,
          amount_out_usd: 119_200,
          dex: "Uniswap V3",
          price_impact: 0.007,
        },
      ],
    },
    related_wallets: {
      data: [
        {
          address: "0x1abc...9def",
          relation: "sent_to",
          interaction_count: 8,
          total_value_usd: 340_000,
          labels: ["Smart Money", "DeFi Trader"],
        },
        {
          address: "0x2fed...3abc",
          relation: "received_from",
          interaction_count: 3,
          total_value_usd: 95_000,
          labels: ["Smart Money"],
        },
        {
          address: "0x3abc...7890",
          relation: "sent_to",
          interaction_count: 12,
          total_value_usd: 780_000,
          labels: ["Institutional", "Multi-sig"],
        },
      ],
    },
  },

  whale: {
    balance: {
      total_value_usd: 28_450_000,
      data: [
        {
          token_symbol: "ETH",
          token_address: "0x0000000000000000000000000000000000000000",
          balance: "8420.5",
          value_usd: 15_303_310,
          chain: "ethereum",
        },
        {
          token_symbol: "WBTC",
          token_address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          balance: "124.8",
          value_usd: 7_862_000,
          chain: "ethereum",
        },
        {
          token_symbol: "USDT",
          token_address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
          balance: "5_284_690",
          value_usd: 5_284_690,
          chain: "ethereum",
        },
      ],
    },
    pnl_summary: {
      winrate: 0.58,
      realized_pnl_usd: 4_230_000,
      unrealized_pnl_usd: 12_800_000,
      total_trades: 12,
      best_trade_usd: 3_200_000,
      worst_trade_usd: -450_000,
      average_holding_days: 387,
    },
    pnl: {
      data: [
        {
          token_symbol: "ETH",
          buy_usd: 6_400_000,
          sell_usd: 9_600_000,
          realized_pnl: 3_200_000,
          first_trade: "2020-11-05",
          last_trade: "2021-11-10",
        },
        {
          token_symbol: "WBTC",
          buy_usd: 4_200_000,
          sell_usd: 7_800_000,
          realized_pnl: 3_600_000,
          first_trade: "2020-03-18",
          last_trade: "2021-04-14",
        },
      ],
    },
    transactions: {
      total_count: 18,
      recent: [
        {
          tx_hash: "0xdeadbeef12...",
          timestamp: "2024-06-01T10:00:00Z",
          type: "transfer",
          value_usd: 4_200_000,
          protocol: "Direct Transfer",
        },
        {
          tx_hash: "0xcafe123456...",
          timestamp: "2023-12-15T16:45:00Z",
          type: "transfer",
          value_usd: 8_900_000,
          protocol: "Direct Transfer",
        },
      ],
    },
    dex_trades: {
      data: [],
    },
    related_wallets: {
      data: [
        {
          address: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
          relation: "received_from",
          interaction_count: 4,
          total_value_usd: 45_000_000,
          labels: ["Exchange Hot Wallet", "Binance"],
        },
        {
          address: "0x28C6...d60",
          relation: "sent_to",
          interaction_count: 2,
          total_value_usd: 12_000_000,
          labels: ["Cold Storage", "Multi-sig"],
        },
      ],
    },
  },

  retail: {
    balance: {
      total_value_usd: 3_847.23,
      data: [
        {
          token_symbol: "ETH",
          token_address: "0x0000000000000000000000000000000000000000",
          balance: "0.82",
          value_usd: 1_490.04,
          chain: "ethereum",
        },
        {
          token_symbol: "PEPE",
          token_address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
          balance: "48_200_000",
          value_usd: 963.64,
          chain: "ethereum",
        },
        {
          token_symbol: "SHIB",
          token_address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
          balance: "34_500_000",
          value_usd: 728.55,
          chain: "ethereum",
        },
        {
          token_symbol: "USDC",
          token_address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          balance: "665",
          value_usd: 665,
          chain: "ethereum",
        },
      ],
    },
    pnl_summary: {
      winrate: 0.34,
      realized_pnl_usd: -4_234.67,
      unrealized_pnl_usd: -1_820,
      total_trades: 312,
      best_trade_usd: 1_240,
      worst_trade_usd: -3_800,
      average_holding_days: 4.2,
    },
    pnl: {
      data: [
        {
          token_symbol: "PEPE",
          buy_usd: 3_800,
          sell_usd: 0,
          realized_pnl: -3_800,
          first_trade: "2023-05-04",
          last_trade: "2023-05-04",
        },
        {
          token_symbol: "ARB",
          buy_usd: 820,
          sell_usd: 2_060,
          realized_pnl: 1_240,
          first_trade: "2023-03-25",
          last_trade: "2023-04-02",
        },
        {
          token_symbol: "FLOKI",
          buy_usd: 560,
          sell_usd: 180,
          realized_pnl: -380,
          first_trade: "2023-06-10",
          last_trade: "2023-06-22",
        },
      ],
    },
    transactions: {
      total_count: 876,
      recent: [
        {
          tx_hash: "0x1234abcd...",
          timestamp: "2024-09-21T22:14:00Z",
          type: "swap",
          value_usd: 230,
          protocol: "Uniswap V2",
        },
        {
          tx_hash: "0x5678efgh...",
          timestamp: "2024-09-21T21:58:00Z",
          type: "swap",
          value_usd: 115,
          protocol: "1inch",
        },
        {
          tx_hash: "0x9012ijkl...",
          timestamp: "2024-09-21T18:30:00Z",
          type: "swap",
          value_usd: 340,
          protocol: "Uniswap V2",
        },
      ],
    },
    dex_trades: {
      data: [
        {
          timestamp: "2024-09-21T22:14:00Z",
          token_in: "ETH",
          token_out: "PEPE",
          amount_in_usd: 230,
          amount_out_usd: 219,
          dex: "Uniswap V2",
          price_impact: 0.048,
        },
        {
          timestamp: "2024-09-21T21:58:00Z",
          token_in: "USDC",
          token_out: "SHIB",
          amount_in_usd: 115,
          amount_out_usd: 108,
          dex: "1inch",
          price_impact: 0.061,
        },
      ],
    },
    related_wallets: {
      data: [
        {
          address: "0xef12...a234",
          relation: "received_from",
          interaction_count: 2,
          total_value_usd: 1_200,
          labels: [],
        },
        {
          address: "Coinbase",
          relation: "received_from",
          interaction_count: 18,
          total_value_usd: 24_300,
          labels: ["CEX", "Coinbase"],
        },
      ],
    },
  },

  insider: {
    balance: {
      total_value_usd: 1_245_680,
      data: [
        {
          token_symbol: "ETH",
          token_address: "0x0000000000000000000000000000000000000000",
          balance: "145.2",
          value_usd: 263_854.8,
          chain: "ethereum",
        },
        {
          token_symbol: "BLUR",
          token_address: "0x5283D291DBCF85356A21bA090E6db59121208b44",
          balance: "4_200_000",
          value_usd: 630_000,
          chain: "ethereum",
        },
        {
          token_symbol: "USDC",
          token_address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          balance: "351_825",
          value_usd: 351_825,
          chain: "ethereum",
        },
      ],
    },
    pnl_summary: {
      winrate: 0.91,
      realized_pnl_usd: 2_340_000,
      unrealized_pnl_usd: 780_000,
      total_trades: 23,
      best_trade_usd: 1_800_000,
      worst_trade_usd: -28_000,
      average_holding_days: 3.8,
    },
    pnl: {
      data: [
        {
          token_symbol: "BLUR",
          buy_usd: 180_000,
          sell_usd: 1_980_000,
          realized_pnl: 1_800_000,
          first_trade: "2023-02-12",
          last_trade: "2023-02-18",
        },
        {
          token_symbol: "DYDX",
          buy_usd: 320_000,
          sell_usd: 850_000,
          realized_pnl: 530_000,
          first_trade: "2023-09-25",
          last_trade: "2023-10-08",
        },
      ],
    },
    transactions: {
      total_count: 67,
      recent: [
        {
          tx_hash: "0xabcdef99...",
          timestamp: "2024-09-14T03:22:00Z",
          type: "swap",
          value_usd: 180_000,
          protocol: "Uniswap V3",
        },
      ],
    },
    dex_trades: {
      data: [
        {
          timestamp: "2023-02-12T02:14:00Z",
          token_in: "USDC",
          token_out: "BLUR",
          amount_in_usd: 180_000,
          amount_out_usd: 179_100,
          dex: "Uniswap V3",
          price_impact: 0.005,
          note: "Purchased 30 minutes before major listing announcement",
        },
      ],
    },
    related_wallets: {
      data: [
        {
          address: "0xfresh...001",
          relation: "received_from",
          interaction_count: 1,
          total_value_usd: 180_000,
          labels: ["Fresh Wallet"],
        },
        {
          address: "0x7abc...def0",
          relation: "sent_to",
          interaction_count: 1,
          total_value_usd: 1_750_000,
          labels: [],
        },
      ],
    },
  },
};
