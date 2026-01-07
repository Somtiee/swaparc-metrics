import { ethers } from "ethers";

export default async function handler(req, res) {
  const provider = new ethers.JsonRpcProvider(
    "https://rpc.testnet.arc.network"
  );

  const ABI = [
    "event TokenExchange(address buyer,uint256 sold_id,uint256 tokens_sold,uint256 bought_id,uint256 tokens_bought)"
  ];

  const pool = new ethers.Contract(
    "0x2F4490e7c6F3DaC23ffEe6e71bFcb5d1CCd7d4eC",
    ABI,
    provider
  );

  const latestBlock = await provider.getBlockNumber();
  const events = await pool.queryFilter("TokenExchange", 0, latestBlock);

  let swaps = events.length;
  let volumeUSDC = 0;

  for (const e of events) {
    if (e.args.sold_id === 0n)
      volumeUSDC += Number(ethers.formatUnits(e.args.tokens_sold, 6));
    if (e.args.bought_id === 0n)
      volumeUSDC += Number(ethers.formatUnits(e.args.tokens_bought, 6));
  }

  res.json({
    swaps,
    volumeUSDC: volumeUSDC.toFixed(2),
  });
}
