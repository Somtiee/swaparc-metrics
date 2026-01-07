import { ethers } from "ethers";

const RPC = "https://rpc.testnet.arc.network";
const POOL_ADDRESS = "0x2F4490e7c6F3DaC23ffEe6e71bFcb5d1CCd7d4eC";

const ABI = [
  "event TokenExchange(address buyer,uint256 sold_id,uint256 tokens_sold,uint256 bought_id,uint256 tokens_bought)"
];

const provider = new ethers.JsonRpcProvider(RPC);
const pool = new ethers.Contract(POOL_ADDRESS, ABI, provider);

async function scan() {
  let totalSwaps = 0;
  let totalVolumeUSDC = 0;

  const latestBlock = await provider.getBlockNumber();

  const events = await pool.queryFilter(
    "TokenExchange",
    0,
    latestBlock
  );

  for (const e of events) {
    totalSwaps++;

    // sold_id == 0 → USDC (based on your tokenIndices)
    if (e.args.sold_id === 0n) {
      totalVolumeUSDC += Number(
        ethers.formatUnits(e.args.tokens_sold, 6)
      );
    }

    // bought_id == 0 → USDC
    if (e.args.bought_id === 0n) {
      totalVolumeUSDC += Number(
        ethers.formatUnits(e.args.tokens_bought, 6)
      );
    }
  }

  console.log("TOTAL SWAPS:", totalSwaps);
  console.log("TOTAL USDC VOLUME:", totalVolumeUSDC.toFixed(2));
}

scan();
