import { useAddress, ConnectWallet, Web3Button, useContract, useNFTBalance, useDisconnect } from '@thirdweb-dev/react';
import { useState, useEffect, useMemo } from 'react';
import { AddressZero } from "@ethersproject/constants";

const Main = () => {
  // Use the hooks thirdweb give us.
  const address = useAddress();
  const disconnect = useDisconnect();
  console.log("👋 Address:", address);

  // Initialize our Edition Drop contract
  const editionDropAddress = process.env.REACT_APP_EDITION_DROP_ADDRESS;
  const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS;
  const voteAddress = process.env.REACT_APP_VOTE_ADDRESS;
  // Initialize our token contract
  const { contract: token } = useContract(tokenAddress, 'token');
  const { contract: vote } = useContract(voteAddress, "vote");
  const { contract: editionDrop } = useContract(editionDropAddress, "edition-drop");
  // Hook to check if the user has our NFT
  const { data: nftBalance } = useNFTBalance(editionDrop, address, "0")

  const hasClaimedNFT = useMemo(() => {
    return nftBalance && nftBalance.gt(0)
  }, [nftBalance])

  // Holds the amount of token each member has in state.
  const [memberTokenAmounts, setMemberTokenAmounts] = useState([]);
  // The array holding all of our members addresses.
  const [memberAddresses, setMemberAddresses] = useState([]);

  // A fancy function to shorten someones wallet address, no need to show the whole thing.
  const shortenAddress = (str) => {
    return str.substring(0, 6) + '...' + str.substring(str.length - 4);
  };
  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [myVotingPower, setVoteBalance] = useState(0);

  // Retrieve all our existing proposals from the contract.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // A simple call to vote.getAll() to grab the proposals.
    const getAllProposals = async () => {
      try {
        const proposals = await vote.getAll();
        setProposals(proposals);
        console.log("🌈 Proposals:", proposals);
      } catch (error) {
        console.log("failed to get proposals", error);
      }
    };
    getAllProposals();
  }, [hasClaimedNFT, vote]);

  // We also need to check if the user already voted.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // If we haven't finished retrieving the proposals from the useEffect above
    // then we can't check if the user voted yet!
    if (!proposals.length) {
      return;
    }

    const checkIfUserHasVoted = async () => {
      try {
        const hasVoted = await vote.hasVoted(proposals.filter(proposal => proposal.state === 1)[0].proposalId, address);
        setHasVoted(hasVoted);
        if (hasVoted) {
          console.log("🥵 User has already voted");
        } else {
          console.log("🙂 User has not voted yet");
        }
      } catch (error) {
        console.error("Failed to check if wallet has voted", error);
      }
    };
    checkIfUserHasVoted();

  }, [hasClaimedNFT, proposals, address, vote]);

  // This useEffect grabs all the addresses of our members holding our NFT.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // Just like we did in the 7-airdrop-token.js file! Grab the users who hold our NFT
    // with tokenId 0.
    const getAllAddresses = async () => {
      try {
        const memberAddresses = await editionDrop?.history.getAllClaimerAddresses(
          0,
        );
        setMemberAddresses(memberAddresses);
        console.log('🚀 Members addresses', memberAddresses);
      } catch (error) {
        console.error('failed to get member list', error);
      }
    };
    getAllAddresses();
  }, [hasClaimedNFT, editionDrop?.history]);

  // This useEffect grabs the # of token each member holds.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    const getAllBalances = async () => {
      try {
        const amounts = await token?.history.getAllHolderBalances();
        setMemberTokenAmounts(amounts);
        console.log('👜 Amounts', amounts);
      } catch (error) {
        console.error('failed to get member balances', error);
      }
    };
    getAllBalances();
  }, [hasClaimedNFT, token?.history]);

  
  // obtain the total amount of tokens in the treasury using: {vote.balanceOfToken(token.address)}
  useEffect(() => {
    const fetchTokenBalance = async () => {
      try {

        const balance = Math.floor((await vote.balanceOfToken(tokenAddress)).value/10**18).toString();
        const voteBalance = Math.floor((await token.balanceOf(address)).value/10**18).toString();
        setTokenBalance(balance);
        setVoteBalance(voteBalance);
      } catch (error) {
        console.error("Failed to fetch token balance:", error);
      }
    };
    
    fetchTokenBalance();
  }, [vote]);


  // Now, we combine the memberAddresses and memberTokenAmounts into a single array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      // We're checking if we are finding the address in the memberTokenAmounts array.
      // If we are, we'll return the amount of token the user has.
      // Otherwise, return 0.
      const member = memberTokenAmounts?.find(({ holder }) => holder === address);

      return {
        address,
        tokenAmount: member?.balance.displayValue || '0',
      };
    });
  }, [memberAddresses, memberTokenAmounts]);


  // Calculate the total amount of tokens
  const totalTokens = useMemo(() => {
    return memberTokenAmounts.reduce((total, token) => total + parseFloat(token.balance.displayValue || 0), 0);
  }, [memberTokenAmounts]);

  // Formatter for numbers with commas
  const numberFormatter = new Intl.NumberFormat('en-US');

  // Create and sort the member list by voting power in descending order
  const sortedMemberList = useMemo(() => {
    return memberAddresses.map((address, index) => {
      const tokens = parseFloat(memberTokenAmounts[index]?.balance.displayValue || 0);
      const votingPower = (tokens / totalTokens) * 100; // calculate as a percentage

      return {
        address,
        tokens: numberFormatter.format(tokens), // format tokens with commas
        votingPower,
      };
    }).sort((a, b) => b.votingPower - a.votingPower); // sort by voting power descending
  }, [memberAddresses, memberTokenAmounts, totalTokens]);

  // Function to handle delegation of tokens
  const handleDelegate = async (delegateToAddress) => {
    try {
      await token.delegateTo(delegateToAddress);
      console.log(`Delegation successful to ${delegateToAddress}`);
      alert(`Tokens successfully delegated to ${delegateToAddress}`);
    } catch (error) {
      console.error('Delegation failed:', error);
      alert('Delegation failed: ' + error.message);
    }
  };

  if (!address) {
    return (
      <div class="max-w-5xl pt-52 pb-24 mx-auto text-center">
        <h1 class="text-80 font-bold text-white mb-6">
          Governance Voting Portal
        </h1>
        <h2 class="text-2xl font-semibold pb-11 text-gray-300">
          Vote with or delegate your FT tokens to <br/>help protect the integrity of the FT5004 DeFi protocol
        </h2>
        <ConnectWallet />
      </div>
    );
  }

  // only DAO members will see this. Render all the members + token amounts.
  if (hasClaimedNFT) {
    return (
      <div class="max-w-5xl pt-52 pb-24 mx-auto text-center">        
        <h1 class="text-80 font-bold text-white mb-6">
          Governance Voting Portal
        </h1>
        <h2 class="text-2xl font-semibold pb-11 text-gray-700">
          Vote with or delegate your FT tokens to <br/>help protect the integrity of the FT5004 DeFi protocol
        </h2>
        <button onClick={disconnect} className="disconnect-button" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Disconnect Wallet</button>

        <h2 class="pt-20 mb-1 text-2xl font-semibold tracking-tighter text-center text-gray-200 lg:text-7xl md:text-6xl">
          Governance Statistics
        </h2>
        <br></br>
        <div class="container mx-auto flex flex-col items-center justify-center py-8">
          <table class="min-w-full divide-y divide-gray-200 shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">          
            <thead class="bg-gray-700 text-white">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">FT in Treasury</th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">My Voting Power</th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Total Proposal Count</th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Active Proposal Count</th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Passed Proposal Count</th>
              </tr>
            </thead>
            
            <tbody class="bg-gray-900 divide-y divide-gray-700 text-gray-200">
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">{tokenBalance}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center">{myVotingPower}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center">{proposals.length}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center">{proposals.filter(proposal => proposal.state === 1).length}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center">{proposals.filter(proposal => proposal.state === 4).length + proposals.filter(proposal => proposal.state === 7).length}</td>
              </tr>            
            </tbody>
          </table>
        </div>

        <div>
          <div className="member-list" class="container flex flex-col items-center justify-center mx-auto">
            <h2 class="pt-40 mb-1 text-2xl font-semibold tracking-tighter text-center text-gray-200 lg:text-7xl md:text-6xl">Member List</h2>
            <br></br>
            <br></br>
            <table class="min-w-full divide-y divide-gray-200 shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">         
              <thead class="bg-gray-700 text-white">
                <tr>
                  <th class="px-3 py-3 whitespace-nowrap text-center">Address</th>
                  <th class="px-3 py-3 whitespace-nowrap text-center">Token Amount</th>
                  <th class="px-3 py-3 whitespace-nowrap text-center">Voting Power</th>
                  <th class="px-3 py-3 whitespace-nowrap text-center">Delegate</th>
                </tr>
              </thead>
              <tbody class="bg-gray-900 divide-y divide-gray-700 text-gray-200">
                {sortedMemberList.map((member, index) => (
                  //  add space between the rows
                  <tr key={index}>
                    <td class="px-3 py-3 whitespace-nowrap text-center">{shortenAddress(member.address)}</td>
            
                    <td class="px-3 py-3 whitespace-nowrap text-center">{member.tokens}</td>
                    <td class="px-3 py-3 whitespace-nowrap text-center">{member.votingPower.toFixed(2) + '%'}</td>
                    <td class="px-3 py-3 whitespace-nowrap text-center">
                      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleDelegate(member.address)}>
                        Delegate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-black text-white p-6 rounded-lg">
            <h2 class="pt-40 mb-1 text-2xl font-semibold tracking-tighter text-center text-gray-200 lg:text-7xl md:text-6xl">
              Active Proposals
            </h2>
            <br></br>            
            <div classname="proposals" class="max-w-6xl mx-auto px-4 sm:px-6 text-center place-items-center">          
              <form
              className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  //before we do async things, we want to disable the button to prevent double clicks
                  setIsVoting(true);

                  // lets get the votes from the form for the values
                  const votes = proposals.filter(proposal => proposal.state === 1).map((proposal) => {
                    const voteResult = {
                      proposalId: proposal.proposalId,
                      //abstain by default
                      vote: 2,
                    };
                    proposal.votes.forEach((vote) => {
                      const elem = document.getElementById(
                        proposal.proposalId + '-' + vote.type,
                      );

                      if (elem.checked) {
                        voteResult.vote = vote.type;
                        return;
                      }
                    });
                    return voteResult;
                  });

                  // first we need to make sure the user delegates their token to vote
                  try {
                    //we'll check if the wallet still needs to delegate their tokens before they can vote
                    const delegation = await token.getDelegationOf(address);
                    // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                    if (delegation === AddressZero) {
                      //if they haven't delegated their tokens yet, we'll have them delegate them before voting
                      await token.delegateTo(address);
                    }
                    // then we need to vote on the proposals
                    try {
                      await Promise.all(
                        votes.map(async ({ proposalId, vote: _vote }) => {
                          // before voting we first need to check whether the proposal is open for voting
                          // we first need to get the latest state of the proposal
                          const proposal = await vote.get(proposalId);
                          // then we check if the proposal is open for voting (state === 1 means it is open)
                          if (proposal.state === 1) {
                            // if it is open for voting, we'll vote on it
                            return vote.vote(proposalId, _vote);
                          }
                          // if the proposal is not open for voting we just return nothing, letting us continue
                          return;
                        }),
                      );
                      // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                      setHasVoted(true);
                      // and log out a success message
                      console.log('successfully voted');
                    } catch (err) {
                      console.error('failed to vote', err);
                    }
                  } catch (err) {
                    console.error('failed to delegate tokens');
                  } finally {
                    // in *either* case we need to set the isVoting state to false to enable the button again
                    setIsVoting(false);
                  }
                }}
              >
                {proposals.filter(proposal => proposal.state === 1).map((proposal) => (
                  <div key={proposal.proposalId} className="bg-gray-800 table-auto border-separate border-spacing-2 rounded-md pt-2 value-text text-md text-gray-200 fkrr1">
                    <h5>{proposal.description}</h5>
                    <div>
                      {proposal.votes.map(({ type, label }) => (
                        <span key={type} className="items-center mr-2">
                          <input
                            className="mr-2"
                            type="radio"
                            id={proposal.proposalId + '-' + type}
                            name={proposal.proposalId}
                            value={type}
                            defaultChecked={type === 2}
                          />
                          <label htmlFor={proposal.proposalId + '-' + type}>
                            {label}
                          </label>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <button disabled={isVoting || hasVoted} type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  {isVoting
                    ? 'Voting...'
                    : hasVoted
                    ? 'You Already Voted'
                    : 'Submit Votes'}
                </button>
              </form>
                {!hasVoted && (
                  <small class=" text-gray-200 max-w-6xl mx-auto px-4 sm:px-6 text-center place-items-center">
                    This will trigger multiple transactions that you will need to
                    sign.
                  </small>
                )}
            </div>
          </div>

          <div className="bg-black text-white p-6 rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight text-center lg:text-7xl md:text-6xl">
              Historical Proposals
            </h2>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                try {
                  await Promise.all(
                    proposals.filter(proposal => proposal.state !== 1).map(async ({ proposalId }) => {
                      const proposal = await vote.get(proposalId);

                      if (proposal.state === 4) {
                        console.log('executing proposal', proposalId);
                        return vote.execute(proposalId);
                      }
                    }),
                  );
                } catch (err) {
                  console.error('failed to execute votes', err);
                } 
              }}
            >
                {proposals
                  .filter(proposal => proposal.state !== 1)
                  .sort((a, b) => b.proposalId - a.proposalId)  // Sorting proposals by proposalId in descending order
                  .map(proposal => (
                    <div  className="bg-gray-800 table-auto border-separate border-spacing-2 rounded-md pt-2 value-text text-md text-gray-200 fkrr1">
                      <h5>{`${proposal.description}`}</h5> 
                      <p>Status: {proposal.state === 3 ? ' ❌ Not Passed' : proposal.state === 4 ? '✔️ Passed': '🚀 Execued'}</p>
                    </div>
                ))}
              <button 
                type="submit" 
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-300"
              >
                Execute passed proposals
              </button>
            </form>
          </div>


        </div>
      </div>
    );
  }

  // Render mint nft screen.
  return (
    <div className="mint-nft">
      <h1>Mint your free 🍪DAO Membership NFT</h1>
      <div className="btn-hero">
        <Web3Button
          contractAddress={process.env.REACT_APP_EDITION_DROP_ADDRESS}
          action={(contract) => {
            contract.erc1155.claim(0, 1);
          }}
          onSuccess={() => {
            console.log(
              `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${process.env.REACT_APP_EDITION_DROP_ADDRESS()}/0`,
            );
          }}
          onError={(error) => {
            console.error('Failed to mint NFT', error);
          }}
        >
          Mint your NFT (FREE)
        </Web3Button>
      </div>
    </div>
  );
};

export default Main;
