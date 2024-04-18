import { useAddress, ConnectWallet, Web3Button, useContract, useNFTBalance, useDisconnect } from '@thirdweb-dev/react';
import { useState, useEffect, useMemo } from 'react';
import { AddressZero } from "@ethersproject/constants";

const Main = () => {
  const address = useAddress();
  const disconnect = useDisconnect();
  const { contract: token } = useContract(process.env.REACT_APP_TOKEN_ADDRESS, 'token');
  const { contract: vote } = useContract(process.env.REACT_APP_VOTE_ADDRESS, "vote");
  const { contract: editionDrop } = useContract(process.env.REACT_APP_EDITION_DROP_ADDRESS, "edition-drop");
  const { data: nftBalance } = useNFTBalance(editionDrop, address, "0");

  // State hooks
  const [memberTokenAmounts, setMemberTokenAmounts] = useState([]);
  const [memberAddresses, setMemberAddresses] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Utility function to shorten wallet address
  const shortenAddress = (str) => str ? `${str.substring(0, 6)}...${str.substring(str.length - 4)}` : '';
  const hasClaimedNFT = useMemo(() => nftBalance && nftBalance.gt(0), [nftBalance]);

  // Define fetchProposals function
  const fetchProposals = async () => {
    try {
      const fetchedProposals = await vote.getAll();
      setProposals(fetchedProposals.filter(proposal => proposal.state === 1));
      console.log("🌈 Proposals:", fetchedProposals);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    }
  };

  // Add a console log to check if editionDrop is defined
  useEffect(() => {
    if (editionDrop) {
      console.log("Contract loaded:", editionDrop);
    } else {
      console.log("Contract not loaded");
    }
  }, [editionDrop]);

  useEffect(() => {
    if (hasClaimedNFT) {
      fetchProposals();
      fetchMemberDetails();
    }
  }, [hasClaimedNFT]);

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

  // Fetch historical proposals
  useEffect(() => {
    const fetchHistoricalProposals = async () => {
      try {
        const fetchedProposals = await vote.getAll();
        setProposals(fetchedProposals.filter(proposal => proposal.state !== 1));
      } catch (error) {
        console.error("Error fetching historical proposals:", error);
      }
    };

    fetchHistoricalProposals();
  }, [vote]);

  // Execute passed proposals
  const executeProposals = async (event) => {
    event.preventDefault();
    try {
      const executableProposals = proposals.filter(p => p.state === 4);
      for (let proposal of executableProposals) {
        await vote.execute(proposal.proposalId);
        console.log(`Executed proposal ${proposal.proposalId}`);
      }
      alert("Executed all passed proposals.");
    } catch (error) {
      console.error("Execution error:", error);
    }
  };

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const fetchedProposals = await vote.getAll();
        setProposals(fetchedProposals.filter(proposal => proposal.state === 1));
      } catch (error) {
        console.error("Error fetching proposals:", error);
      }
    };

    fetchProposals();
  }, [vote]);

  const handleVoteSubmission = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVoting(true);

    const votes = proposals.map(proposal => {
      const voteResult = {
        proposalId: proposal.proposalId,
        vote: document.querySelector(`input[name="${proposal.proposalId}"]:checked`).value
      };
      return voteResult;
    });

    try {
      await token.delegateTo(address);
      await Promise.all(
        votes.map(({ proposalId, vote }) =>
          vote.get(proposalId).then(proposal => {
            if (proposal.state === 1) {
              return vote.vote(proposalId, vote);
            }
          })
        )
      );
      setHasVoted(true);
      console.log('Successfully voted');
    } catch (error) {
      console.error('Voting error:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const fetchMemberDetails = async () => {
    try {
      const addresses = await editionDrop.history.getAllClaimerAddresses(0);
      const amounts = await token.history.getAllHolderBalances();
      setMemberAddresses(addresses);
      setMemberTokenAmounts(amounts);
    } catch (error) {
      console.error("Failed to fetch member details", error);
    }
  };  


  const processVotes = async (votes) => {
    // Placeholder: Replace this with your actual voting logic
    console.log("Processing these votes:", votes);
    // Simulate a network call
    return new Promise((resolve) => setTimeout(resolve, 2000));
  };

  const voteOnProposal = async (vote, proposalId) => {
    // Placeholder function to simulate voting mechanism
    console.log(`Voting ${vote} on proposal ${proposalId}`);
  };

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
      await token.delegate(delegateToAddress);
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
        <h2 class="text-2xl font-semibold pb-11 text-gray-700">
          Vote with or delegate your FT tokens to <br/>help protect the integrity of the FT5004 DeFi protocol
        </h2>
        <ConnectWallet />
      </div>
    );
  }

  if (hasClaimedNFT) {
    return (
      <div class="max-w-5xl pt-52 pb-24 mx-auto text-center">        
        <h1 class="text-80 font-bold text-white mb-6">
          Governance Voting Portal
        </h1>
        <h2 class="text-2xl font-semibold pb-11 text-gray-700">
          Vote with or delegate your FT tokens to <br/>help protect the integrity of the FT5004 DeFi protocol
        </h2>
        <button onClick={disconnect} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Disconnect Wallet</button>

        <h2 class="pt-20 mb-1 text-2xl font-semibold tracking-tighter text-center text-gray-200 lg:text-7xl md:text-6xl">
          Governance Statistics
        </h2>      
        <div class="container flex flex-col items-center justify-center mx-auto">
          <table class="table-auto border-separate border-spacing-2 border border-slate-400">          
            <thead>
              <tr>
                <th> FT on Hat</th>
                <th> Active Polls</th>
                <th> Aligned Delegates</th>
                <th> Shadow Delegates</th>
                <th> FT Delegates</th>
                <th> FT in Chief</th>
              </tr>
            </thead>
            <tbody class="pt-2 value-text text-md text-gray-200 fkrr1">
              <tr>
                <td>105,678 FT</td>
                <td class="text-center">3</td>
                <td class="text-center">33</td>
                <td class="text-center">52</td>
                <td class="text-center">148,287 FT</td>
                <td class="text-center">149,271 FT</td>
              </tr>            
            </tbody>
          </table>
        </div>

        <div className="member-list" class="container flex flex-col items-center justify-center mx-auto">>
          <h2 class="pt-40 mb-1 text-2xl font-semibold tracking-tighter text-center text-gray-200 lg:text-7xl md:text-6xl">Member List</h2>
          <table class="table-auto border-separate border-spacing-2 border border-slate-400">
            <thead>
              <tr>
                <th class="text-white mb-6">Address</th>
                <th class="text-white mb-6">Token Amount</th>
                <th class="text-white mb-6">Voting Power</th>
                <th class="text-white mb-6">Delegate</th>
              </tr>
            </thead>
            <tbody class="pt-2 value-text text-md text-gray-200 fkrr1">
              {sortedMemberList.map((member, index) => (
                <tr key={index}>
                  <td>{shortenAddress(member.address)}</td>
                  <td>{member.tokens}</td>
                  <td>{member.votingPower.toFixed(2) + '%'}</td>
                  <td>
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleDelegate(member.address)}>
                      Delegate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <br></br>
        <br></br>


        <h2 class="pt-40 mb-1 text-2xl font-semibold tracking-tighter text-center text-gray-200 lg:text-7xl md:text-6xl">
          Active Proposals
        </h2>
        <br></br>
        <p class="mx-auto text-xl text-center text-gray-300 font-normal leading-relaxed fs521 lg:w-2/3">
          4 POLLS - ENDING MAY 18 2024 16:00 UTC
        </p>
        <div classname="proposals" class="max-w-6xl mx-auto px-4 sm:px-6 text-center place-items-center">          
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsVoting(true); // Start voting process

              // Collect votes from form inputs
              const votes = proposals.filter(proposal => proposal.state === 1).map((proposal) => {
                const voteResult = { proposalId: proposal.proposalId, vote: 2 }; // Default vote to 'abstain'
                proposal.votes.forEach((vote) => {
                  const elem = document.getElementById(`${proposal.proposalId}-${vote.type}`);
                  if (elem.checked) {
                    voteResult.vote = vote.type; // Update vote based on selection
                  }
                });
                return voteResult;
              });

              try {
                const delegation = await token.getDelegationOf(address); // Check token delegation
                if (delegation === AddressZero) {
                  await token.delegateTo(address); // Delegate if not already done
                }

                // Execute votes
                const results = await Promise.all(votes.map(async ({ proposalId, vote }) => {
                  const proposal = await vote.get(proposalId);
                  if (proposal.state === 1) { // Ensure proposal is open for voting
                    return vote.vote(proposalId, vote);
                  }
                }));

                setHasVoted(true); // Mark as voted
                console.log('Successfully voted', results);
              } catch (error) {
                console.error('Voting error:', error);
              } finally {
                setIsVoting(false); // Reset voting status
              }
            }}
            className="space-y-4"
          >
            {proposals.filter(proposal => proposal.state === 1).map((proposal) => (
              <div key={proposal.proposalId} className="card p-4 shadow-lg rounded-lg">
                <h5 className="text-lg font-bold">{proposal.description}</h5>
                <div className="flex items-center space-x-4">
                  {proposal.votes.map(({ type, label }) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`${proposal.proposalId}-${type}`}
                        name={proposal.proposalId}
                        value={type}
                        defaultChecked={type === 2}
                        className="accent-blue-500"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              disabled={isVoting || hasVoted}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {isVoting ? 'Voting...' : hasVoted ? 'You Already Voted' : 'Submit Votes'}
            </button>
            {!hasVoted && (
              <p className="text-sm text-gray-500 mt-2">
                This will trigger multiple transactions that you will need to sign.
              </p>
            )}
          </form>

        </div>
        
      </div>
    );
  }

  return (
    <div class="max-w-5xl pt-52 pb-24 mx-auto text-center">
      <h1 class="text-80 font-bold text-white mb-6">Mint your free 🍪DAO Membership NFT</h1>
      <Web3Button
        contractAddress={process.env.REACT_APP_EDITION_DROP_ADDRESS}
        action={async (contract) => {
          try {            
            const result = await contract.erc1155.claim(0, 1);
            console.log('Claim result:', result);
          } catch (error) {
            console.error('Error during NFT claim:', error);
            throw error; // Re-throw error to ensure it's caught by onError
          }
        }}
        onSuccess={() => console.log(`🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${process.env.REACT_APP_EDITION_DROP_ADDRESS}/0`)}
        onError={(error) => console.error('Failed to mint NFT:', error)}
      >
        Mint your NFT (FREE)
      </Web3Button>
    </div>
  );
};

export default Main;
