import { ethers } from "ethers";
import fs from "fs";

function loadEnv() {
  try {
    const envFile = fs.readFileSync(".env", "utf-8");
    for (const line of envFile.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {}
}

loadEnv();

const RPC_URL = process.env.DEPLOYER_RPC_URL || "https://evmrpc-testnet.0g.ai";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error("ERROR: DEPLOYER_PRIVATE_KEY not set");
  process.exit(1);
}

const CONTRACTS = JSON.parse(fs.readFileSync("deployment.json", "utf-8")).contracts;

const SET_PRICE_ABI = [
  "function setMintPrice(uint256 newPrice) external",
  "function setMintingEnabled(bool enabled) external",
  "function mintPrice() view returns (uint256)",
  "function mintingEnabled() view returns (bool)",
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const deployer = wallet.address;
  console.log("Configuring contracts as owner:", deployer);

  for (const [name, addr] of Object.entries(CONTRACTS)) {
    const contract = new ethers.Contract(addr, SET_PRICE_ABI, wallet);
    try {
      const currentPrice = await contract.mintPrice();
      console.log(`${name} @ ${addr.slice(0, 10)}... current mintPrice: ${ethers.formatEther(currentPrice)} 0G`);
      if (currentPrice > 0n) {
        const tx = await contract.setMintPrice(0);
        await tx.wait();
        console.log(`  -> setMintPrice(0) done`);
      }
      const enabled = await contract.mintingEnabled();
      if (!enabled) {
        const tx = await contract.setMintingEnabled(true);
        await tx.wait();
        console.log(`  -> setMintingEnabled(true) done`);
      } else {
        console.log(`  -> minting already enabled`);
      }
    } catch (e) {
      // BadgeNFT and LegacyCoreNFT might not have mintPrice
      try {
        const enabled = await contract.mintingEnabled();
        if (!enabled) {
          const tx = await contract.setMintingEnabled(true);
          await tx.wait();
          console.log(`${name} -> setMintingEnabled(true) done`);
        }
      } catch {}
    }
  }

  console.log("\nDone! All contracts configured.");
}

main().catch((e) => { console.error(e); process.exit(1); });
