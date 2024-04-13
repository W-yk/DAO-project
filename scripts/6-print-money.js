import sdk from "./1-initialize-sdk.js";

(async () => {
  try {
    const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS;
    const token = await sdk.getContract(tokenAddress, "token");
    const amount = 5_004_000;
    await token.mint(amount);
    const totalSupply = await token.totalSupply();

    // Print out how many of our token's are out there now!
    console.log("✅ There now is", totalSupply.displayValue, "$FT in circulation");
  } catch (error) {
    console.error("Failed to print money", error);
  }
})();