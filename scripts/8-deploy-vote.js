import sdk from "./1-initialize-sdk.js";
import {appendFileSync} from "fs";
(async () => {
  try {
    const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS;
    const voteContractAddress = await sdk.deployer.deployVote({
      name: "FT5004 DAO VOTE CONTRACT",

      voting_token_address: tokenAddress,

      // These parameters are specified in number of blocks. 
      // Assuming block time of around 13.14 seconds (for Ethereum)

      // After a proposal is created, when can members start voting?
      // For now, we set this to immediately.
      voting_delay_in_blocks: 0,

      // How long do members have to vote on a proposal when it's created?
      // we will set it to 7 day = 6570*7 blocks
      voting_period_in_blocks: 6570*7,

      // The minimum % of the total supply that need to vote for
      // the proposal to be valid after the time for the proposal has ended.
      voting_quorum_fraction: 1,

      // What's the minimum # of tokens a user needs to be allowed to create a proposal?
      proposal_token_threshold: 0,
    });

    console.log(
      "✅ Successfully deployed vote contract, address:",
      voteContractAddress,
    );

    // Here we append the contract address to the .env file
    appendFileSync('.env', `\nREACT_APP_VOTE_ADDRESS=${voteContractAddress}`);
    console.log("✅ Successfully wrote vote address to .env");
  } catch (err) {
    console.error("Failed to deploy vote contract", err);
  }
})();