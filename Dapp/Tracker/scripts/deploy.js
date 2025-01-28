const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const trackerContract = await ethers.deployContract("Tracker");
  const contract_address = await trackerContract.getAddress();
  console.log("Contract address:", contract_address);
  saveFrontendFiles(contract_address);
}

function saveFrontendFiles(contract_address) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "frontend", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ Tracker: contract_address }, undefined, 2)
  );

  const TrackerArtifact = artifacts.readArtifactSync("Tracker");

  fs.writeFileSync(
    path.join(contractsDir, "Tracker.json"),
    JSON.stringify(TrackerArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
