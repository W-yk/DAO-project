import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";


(async () => {
  try {
    const editionDropAddress = process.env.REACT_APP_EDITION_DROP_ADDRESS;
    const editionDrop = await sdk.getContract(editionDropAddress, "edition-drop");
    await editionDrop.createBatch([
      {
        name: "FT5004 DAO Membership",
        description: "This NFT will give you access to FT5004 DAO!",
        image: readFileSync("scripts/assets/NUS_coat_of_arms.svg.png"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})();