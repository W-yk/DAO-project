import { AddressZero } from "@ethersproject/constants";
import sdk from "./1-initialize-sdk.js";
import { readFileSync, appendFileSync } from "fs";

(async () => {
  try {
    const editionDropAddress = await sdk.deployer.deployEditionDrop({
      name: "FT5004 DAO Membership",
      description: "A DAO for FT5004.",
      image: readFileSync("scripts/assets/NUS_coat_of_arms.svg.png"),
      primary_sale_recipient: AddressZero,
    });

    const editionDrop = await sdk.getContract(editionDropAddress, "edition-drop");
    const metadata = await editionDrop.metadata.get();

    console.log(
      "✅ Successfully deployed editionDrop contract, address:",
      editionDropAddress
    );
    console.log("✅ editionDrop metadata:", metadata);

    //append the contract address to the .env file
    appendFileSync('.env', `\nREACT_APP_EDITION_DROP_ADDRESS=${editionDropAddress}`);

    console.log("✅ Successfully wrote editionDrop address to .env");
  } catch (error) {
    console.log("❌ Failed to deploy editionDrop contract or write to .env", error);
  }
})();