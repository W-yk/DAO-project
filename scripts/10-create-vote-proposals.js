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
    // Create proposal to mint 5_004 new token to the treasury.
    const amount = 500_400;
    const description = "Should the DAO mint an additional " + amount + " tokens for another round of airdorp to the community?";
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

  try {
    const voteAddress = process.env.REACT_APP_VOTE_ADDRESS;
    const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS;
    // This is our governance contract.
    const vote = await sdk.getContract(voteAddress, "vote");
    // This is our ERC-20 contract.
    const token = await sdk.getContract(tokenAddress, "token");

    // Create proposal to transfer ourselves 6,900 tokens for being awesome.
    const amount = 5_004;
    const description = "Should the DAO transfer " + amount + " tokens from the treasury to " +
      process.env.WALLET_ADDRESS + " for being awesome?";
    const executions = [
      {
        // Again, we're sending ourselves 0 ETH. Just sending our own token.
        nativeTokenValue: 0,
        transactionData: token.encoder.encode(
          // We're doing a transfer from the treasury to our wallet.
          "transfer",
          [
            process.env.WALLET_ADDRESS,
            ethers.utils.parseUnits(amount.toString(), 18),
          ]
        ),
        toAddress: token.getAddress(),
      },
    ];

    await vote.propose(description, executions);

    console.log(
      "✅ Successfully created proposal to reward ourselves from the treasury, let's hope people vote for it!"
    );
  } catch (error) {
    console.error("failed to create second proposal", error);
  }

  try {
    const voteAddress = process.env.REACT_APP_VOTE_ADDRESS;
    const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS;
    // This is our governance contract.
    const vote = await sdk.getContract(voteAddress, "vote");
    // This is our ERC-20 contract.
    const token = await sdk.getContract(tokenAddress, "token");

    // Create proposal to transfer ourselves 6,900 tokens for being awesome.
    const amount = 5_004;
    const description = "Should the DAO burn " + amount + " tokens from the treasury to prevent inflation?";
    const zeroAddress = "0x" + "0".repeat(40);
    const executions = [
      {
        // Again, we're sending ourselves 0 ETH. Just sending our own token.
        nativeTokenValue: 0,
        transactionData: token.encoder.encode(
          // We're doing a transfer from the treasury to our wallet.
          "transfer",
          [
            zeroAddress,
            ethers.utils.parseUnits(amount.toString(), 18),
          ]
        ),
        toAddress: token.getAddress(),
      },
    ];

    await vote.propose(description, executions);

    console.log(
      "✅ Successfully created proposal to burn tokens!"
    );
  } catch (error) {
    console.error("failed to create second proposal", error);
  }
  
})();