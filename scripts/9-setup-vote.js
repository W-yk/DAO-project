import sdk from "./1-initialize-sdk.js";

const voteAddress = process.env.REACT_APP_VOTE_ADDRESS;
const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS;
(async () => {

  try {
    // This is our governance contract.
    const vote = await sdk.getContract(voteAddress, "vote");
    // This is our ERC-20 contract.
    const token = await sdk.getContract(tokenAddress, "token");
    // Give our treasury the power to mint additional token if needed.
    await token.roles.grant("minter", vote.getAddress());

    console.log(
      "Successfully gave vote contract permissions to act on token contract"
    );
  } catch (error) {
    console.error(
      "failed to grant vote contract permissions on token contract",
      error
    );
    process.exit(1);
  }

  try {
    const vote = await sdk.getContract(voteAddress, "vote");
    const token = await sdk.getContract(tokenAddress, "token");
    const ownedTokenBalance = await token.balanceOf(
      process.env.WALLET_ADDRESS
    );

    // Grab 90% of the supply that we hold.
    const ownedAmount = ownedTokenBalance.displayValue;
    const percent90 = Number(ownedAmount) / 100 * 90;

    // Transfer 90% of the supply to our voting contract.
    await token.transfer(
      vote.getAddress(),
      percent90
    ); 

    console.log("✅ Successfully transferred " + percent90 + " tokens to vote contract");
  } catch (err) {
    console.error("failed to transfer tokens to vote contract", err);
  }
})();