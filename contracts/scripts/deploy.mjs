import { artifacts } from "hardhat";
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
  console.error("ERROR: DEPLOYER_PRIVATE_KEY not set in .env");
  process.exit(1);
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const deployer = wallet.address;

  console.log("Deploying contracts with account:", deployer);
  const balance = await provider.getBalance(deployer);
  console.log("Account balance:", ethers.formatEther(balance), "0G");

  if (balance === 0n) {
    console.error("ERROR: Deployer has no 0G testnet tokens. Get some from faucet first.");
    process.exit(1);
  }

  const deploy = async (name, args = []) => {
    console.log(`\nDeploying ${name}...`);
    const artifact = await artifacts.readArtifact(name);
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    const contract = await factory.deploy(...args);
    await contract.waitForDeployment();
    const addr = await contract.getAddress();
    console.log(`${name} deployed to:`, addr);
    return addr;
  };

  const heroNFT = await deploy("HeroNFT", [
    "https://api.0bomb.game/metadata/hero/",
    0,
  ]);

  const equipmentNFT = await deploy("EquipmentNFT", [
    "https://api.0bomb.game/metadata/equipment/",
    0,
  ]);

  const cosmeticNFT = await deploy("CosmeticNFT", [
    "https://api.0bomb.game/metadata/cosmetic/",
    0,
  ]);

  const legacyCoreNFT = await deploy("LegacyCoreNFT", [
    "https://api.0bomb.game/metadata/legacy/",
  ]);

  const badgeNFT = await deploy("BadgeNFT", [
    "https://api.0bomb.game/metadata/badge/",
  ]);

  const deployment = {
    network: "ogTestnet",
    chainId: (await provider.getNetwork()).chainId.toString(),
    deployer,
    contracts: {
      HeroNFT: heroNFT,
      EquipmentNFT: equipmentNFT,
      CosmeticNFT: cosmeticNFT,
      LegacyCoreNFT: legacyCoreNFT,
      BadgeNFT: badgeNFT,
    },
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync("deployment.json", JSON.stringify(deployment, null, 2));
  console.log("\n=== DEPLOYMENT SUCCESSFUL ===");
  console.log(JSON.stringify(deployment.contracts, null, 2));
  console.log("\nAdd these to your .env.local:");
  console.log(`NEXT_PUBLIC_HERO_NFT_ADDRESS=${heroNFT}`);
  console.log(`NEXT_PUBLIC_EQUIPMENT_NFT_ADDRESS=${equipmentNFT}`);
  console.log(`NEXT_PUBLIC_COSMETIC_NFT_ADDRESS=${cosmeticNFT}`);
  console.log(`NEXT_PUBLIC_LEGACY_CORE_NFT_ADDRESS=${legacyCoreNFT}`);
  console.log(`NEXT_PUBLIC_BADGE_NFT_ADDRESS=${badgeNFT}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deploy failed:", error.message || error);
    process.exit(1);
  });
