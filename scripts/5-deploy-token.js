import { AddressZero } from "@ethersproject/constants";
import sdk from "./1-initialize-sdk.js";
import {appendFileSync} from "fs";

(async () => {
  try {
    // Deploy a standard ERC-20 contract.
    const tokenAddress = await sdk.deployer.deployToken({
      name: "FT5004 DAO Governance Token",
      symbol: "FT",
      primary_sale_recipient: AddressZero,
    });
    console.log(
      "✅ Successfully deployed token contract, address:",
      tokenAddress,
    );

    //append the contract address to the .env file
    appendFileSync('.env', `\nREACT_APP_TOKEN_ADDRESS=${tokenAddress}`);

    console.log("✅ Successfully wrote token address to .env");

  } catch (error) {
    console.error("failed to deploy token contract", error);
  }
})();