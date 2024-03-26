import sdk from "./1-initialize-sdk.js";
import { ethers } from "ethers";

(async () => {
  try {
    const voteAddress = process.env.REACT_APP_VOTE_ADDRESS;
    const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS;
    // This is our governance contract.
    const vote = await sdk.getContract(voteAddress, "vote");
    // This is our ERC-20 contract.
    const token = await sdk.getContract(tokenAddress, "token");
    // Create proposal to mint 420,000 new token to the treasury.
    const amount = 5_004;
    const description = "Should the DAO mint an additional " + amount + " tokens into the treasury?";
    const executions = [
      {
        toAddress: token.getAddress(),
        nativeTokenValue: 0,
        transactionData: token.encoder.encode(
          "mintTo", [
          vote.getAddress(),
          ethers.utils.parseUnits(amount.toString(), 18),
        ]
        ),
      }
    ];

    await vote.propose(description, executions);

    console.log("✅ Successfully created proposal to mint tokens");
  } catch (error) {
    console.error("failed to create first proposal", error);
    process.exit(1);
  }

})();