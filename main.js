// Get graphQL API

async function fetchGraphQL(operationsDoc, operationName, variables) {
  const result = await fetch("https://api.hicdex.com/v1/graphql", {
    method: "POST",
    body: JSON.stringify({
      query: operationsDoc,
      variables: variables,
      operationName: operationName,
    }),
  });
  return await result.json();
}

// List queries

const queryCreatedOBJKTs = `
      query creatorGallery($address: String!) {
        hic_et_nunc_token(where: {creator: {address: {_eq: $address}}, supply: {_gt: 0}}, order_by: {id: desc}) {
          id
          artifact_uri
          display_uri
          thumbnail_uri
          timestamp
          mime
          title
          description
          supply
          token_tags {
            tag {
              tag
            }
          }
          swaps(where: {status: {_eq: "0"}}, order_by: {price: asc}) {
            amount
            amount_left
            creator_id
            price
          }
          token_holders(where: {quantity: {_gt: "0"}}, order_by: {id: asc}) {
            quantity
            holder {
              address
              name
            }
          }
          trades(order_by: {timestamp: desc}) {
            amount
            buyer {
              address
              name
            }
            seller {
              address
              name
            }
            swap {
              price
            }
            timestamp
          }
        }
      }
    `;
const queryCollectedOBJKTs = `
      query collectorGallery($address: String!) {
        hic_et_nunc_token_holder(where: {holder_id: {_eq: $address}, quantity: {_gt: "0"}, token: {supply: {_gt: "0"}}}, order_by: {id: desc}) {
          token {
            id
            artifact_uri
            display_uri
            thumbnail_uri
            timestamp
            mime
            title
            description
            supply
            token_tags {
              tag {
                tag
              }
            }
            creator {
              address
              name
            }
            swaps(where: {status: {_eq: "0"}}, order_by: {price: asc}) {
              amount
              amount_left
              creator_id
              price
            }
          }
        }
      }
    `;
const queryOBJKTPriceHistory = `
      query PriceHistory($token: bigint = "") {
        hic_et_nunc_trade(where: {token_id: {_eq: $token}}, order_by: {swap: {price: desc}}) {
          timestamp
          seller {
            address
          }
          buyer {
            address
            name
          }
          swap {
            price
          }
          token {
            creator {
              address
            }
          }
        }
      }
    `;
const queryOBJKTDetails = `
      query Objkt($id: bigint!) {
        hic_et_nunc_token_by_pk(id: $id) {
          artifact_uri
          creator {
            address
            name
          }
          description
          display_uri
          id
          level
          mime
          royalties
          supply
          thumbnail_uri
          metadata
          timestamp
          title
          token_tags(order_by: {id: asc}) {
            tag {
              tag
            }
          }
          swaps(order_by: {id: asc}) {
            price
            timestamp
            status
            amount
            amount_left
            creator {
              address
              name
            }
          }
          trades(order_by: {timestamp: asc}) {
            amount
            buyer {
              address
              name
            }
            seller {
              address
              name
            }
            swap {
              price
            }
            timestamp
          }
          token_holders(where: {quantity: {_gt: "0"}}, order_by: {id: asc}) {
            quantity
            holder {
              address
              name
            }
          }
          hdao_balance
          extra
        }
      }
    `;
// List of Fetch Requests

// Get created objkts by address

async function fetchCreatedOBJKTs(address) {
  const { errors, data } = await fetchGraphQL(
    queryCreatedOBJKTs,
    "creatorGallery",
    {
      address: address,
    }
  );
  if (errors) {
    console.error(errors);
  }
  const result = data.hic_et_nunc_token;
  console.log({ result });
  return result;
}

// Get collected objkts by address

async function fetchCollectedOBJKTs(address) {
  const { errors, data } = await fetchGraphQL(
    queryCollectedOBJKTs,
    "collectorGallery",
    {
      address: address,
    }
  );
  if (errors) {
    console.error(errors);
  }
  const result = data.hic_et_nunc_token_holder;
  console.log({ result });
  return result;
}

// Get price history of OBJKT

async function fetchOBJKTPriceHistory(token) {
  const { errors, data } = await fetchGraphQL(
    queryOBJKTPriceHistory,
    "PriceHistory",
    {
      token: token,
    }
  );
  if (errors) {
    console.error(errors);
  }
  const result = data.hic_et_nunc_trade;
  console.log({ result });
  return result;
}

// Fetch OBJKT details
async function fetchOBJKTDetails(id) {
  const { errors, data } = await fetchGraphQL(queryOBJKTDetails, "Objkt", {
    id: id,
  });
  if (errors) {
    console.error(errors);
  }
  const result = data.hic_et_nunc_token_by_pk;
  console.log({ result });
  return result;
}

// Fetch random stats for timestamp
async function fetchRandomStatsByDate(date) {
  const { errors, data } = await fetchGraphQL(
    `query HistoricPrice($token: bigint = "") {
        hic_et_nunc_ask_aggregate(where: {timestamp: {_lt: "${date}"}}) {
          aggregate {
            count
            avg {
              price
            }
          }
        }
      }`,
    "HistoricPrice",
    {}
  );
  if (errors) {
    console.error(errors);
  }
  const result = data.hic_et_nunc_ask_aggregate;
  return result;
}

// Get random seed by minute

const getSeedByMinute = function () {
  const dateObj = new Date();
  const month = dateObj.getUTCMonth() + 1; //months from 1-12
  const day = dateObj.getUTCDate();
  const minute = dateObj.getUTCMinutes();
  return day * month + minute;
};

// Generate randomized index by time

const getRandomIndex = function (range) {
  let m_w = 123456789;
  let m_z = 987654321;
  let mask = 0xffffffff;
  // Takes any integer
  function seed(i) {
    m_w = (123456789 + i) & mask;
    m_z = (987654321 - i) & mask;
  }
  // seed random num generator with dateseed
  seed(getSeedByMinute());

  // Returns number between 0 (inclusive) and 1.0 (exclusive),
  // just like Math.random().
  function random() {
    m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
    m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
    var result = ((m_z << 16) + (m_w & 65535)) >>> 0;
    result /= 4294967296;
    return result;
  }
  return Math.floor(random() * range);
};

// Test randomizer function
let mask = 0xffffffff;
var m_w = 123456789;
var m_z = 987654321;
function seedRandomizer1(i) {
  m_w = (123456789 + i) & mask;
  m_z = (987654321 - i) & mask;
}
const randomizerBySeed = function (range) {
  // Takes any integer
  // Returns number between 0 (inclusive) and 1.0 (exclusive),
  // just like Math.random().
  function random() {
    m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
    m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
    var result = ((m_z << 16) + (m_w & 65535)) >>> 0;
    result /= 4294967296;
    return result;
  }
  return Math.floor(random() * range);
};

const getOBJKTbyTag = (OBJKT, tag) =>
  OBJKT.filter((item) => {
    return item.token_tags
      .map((tag) => {
        return tag.tag.tag;
      })
      .includes(tag);
  });

// Declare functions to generate media URIs from OBJKTs

const generateCreationURIs = (creations) =>
  creations.map(
    (creation) =>
      "https://ipfs.io/ipfs/" + creation.display_uri.split("//").slice(-1)[0]
  );

const generateCollectionURIs = (collections) =>
  collections.map(
    (item) =>
      "https://ipfs.io/ipfs/" + item.token.display_uri.split("//").slice(-1)[0]
  );
const getHolders = function (objktDetails) {
  const blacklist = [
    "KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn",
    "tz1Na7eAxDUHsmxEYLFVKheL37S2fPvuYLV6",
  ]; // Ignore marketplace addresses
  const holders = objktDetails.token_holders.map((entity) => {
    return entity.holder;
  });
  // remove blacklisted addresses
  return holders.filter((holder) => !blacklist.includes(holder.address));
};

const getOGBuyers = function (objktDetails) {
  return objktDetails.trades
    .filter((trade) => trade.seller.name == "xor")
    .map((trade, i) => ({ ...trade.buyer, num: i + 1 }));
};

const getDaysSinceCreation = function (timestamp) {
  const date = +new Date(timestamp);
  const now = +new Date();
  const toDays = (ms) => ms / 1000 / 3600 / 24;
  return Math.min(Math.floor(toDays(now - date)), 6);
};
const generateDatesSince = function (timestamp, numDays) {
  const unixTimestamp = +new Date(timestamp);
  const dates = [];
  for (let i = 1; i < numDays + 1; i++) {
    const date = new Date(unixTimestamp + 1000 * 24 * 3600 * i).toISOString();
    dates.push(date);
  }
  return dates;
};

const initRenderLists = function (players) {
  // takes in array of player objects
  const remaining = document.querySelector(".remaining");
  const eliminated = document.querySelector(".eliminated");
  players.forEach((player, i) => {
    // add to remaining list
    remaining.insertAdjacentHTML(
      "beforeend",
      `<li id="${i}" class="remaining_player new-item">${player.num}. ${
        player.name || player.address
      }<li>`
    );
    eliminated.insertAdjacentHTML(
      "beforeend",
      `<li id="${i}" class="eliminated_player new-item removed-item">${
        player.num
      }. ${player.name || player.address}<li>`
    );
  });
  return {
    remainingPlayers: document.querySelectorAll(".remaining_player"),
    eliminatedPlayers: document.querySelectorAll(".eliminated_player"),
  };
};
const run = async function (creatorAddress, tag, threshold) {
  try {
    // Get objkt by address and tag
    const thisCreatorsOBJKTs = await fetchCreatedOBJKTs(creatorAddress);
    const thisOBJKT = getOBJKTbyTag(thisCreatorsOBJKTs, tag.toLowerCase());
    console.log(thisOBJKT);
    // Handle objkt not found
    if (!thisOBJKT.length) {
      throw new Error(
        `Cannot find object in address ${creatorAddress} with tag ${tag}`
      );
    }
    // const thisOBJKTID = thisOBJKT[0].id;
    const thisOBJKTID = 398497;
    // Get Current owner of OBJKT
    // const tokenHolders = thisOBJKT[0].token_holders;
    // console.log(tokenHolders);
    // // const { address: currAddress, name: currName } =
    // //   thisOBJKT[0].token_holders[0].holder;
    // // console.log(currAddress);
    // let currAddress, name;
    // if (thisOBJKT[0].trades.length) {
    //   const { address, name } = thisOBJKT[0].trades[0].buyer;
    //   [currAddress, currName] = [address, name];
    // } else {
    //   [currAddress, currName] = [creatorAddress, "soapbox"];
    // }

    // Get OBJKT details
    const thisOBJKTDetails = await fetchOBJKTDetails(thisOBJKTID);
    console.log(thisOBJKTDetails);
    // get holders
    // const holders = getHolders(thisOBJKTDetails);
    // get users who bought from creator
    const holders = getOGBuyers(thisOBJKTDetails);
    console.log(holders);

    // Only initiate when number of holders reaches threshold
    if (!(holders.length >= threshold)) {
      console.log("not enough holders for game to begin");
      return;
    }
    console.log("Game has begun");
    const timestamp = thisOBJKTDetails.timestamp;
    const daysSince = getDaysSinceCreation(timestamp);
    // Display days remaining
    document.querySelector(".daysremaining").textContent = Math.max(
      6 - daysSince,
      0
    );
    // generate dates for each day since
    const datesSince = generateDatesSince(timestamp, daysSince);

    console.log(datesSince);
    const dateSeeds = await Promise.all(
      datesSince.map(async (date) => {
        const data = await fetchRandomStatsByDate(date);
        return Math.floor(data.aggregate.avg.price / data.aggregate.count);
      })
    );
    console.log("dateseed:");
    console.log(dateSeeds);
    const frame = document.querySelector(".frame");
    // const testData = [...Array(22).keys()];
    let remainingByRound = [...holders];
    const tracker = initRenderLists(holders);
    // frame.innerHTML = `${remainingByRound.map(
    //   (player) => `<ul>${player.num}. ${player.name || player.address}</ul>`
    // )}`;
    // use self invoking function for time delay to run game
    (function runGame(day) {
      if (day > dateSeeds.length - 1) {
        return;
      }
      setTimeout(() => {
        // Seed data
        const dateSeed = dateSeeds[day];
        seedRandomizer1(dateSeed + 2);
        const minRemaining = day;
        const eliminated = [];
        // Eliminate players according to option 1
        let count = 0;
        remainingByRound = remainingByRound.filter((player, i, arr) => {
          if (count >= remainingByRound.length - (6 - minRemaining)) {
            // ensure some players remaining until end
            return true;
          } else {
            const remains = randomizerBySeed(10) > 4; // Eliminates ~ 60% of players each round
            count += +!remains;
            if (!remains) {
              eliminated.push(player);
              // add to eliminated list
              tracker.eliminatedPlayers[player.num - 1].classList.remove(
                "removed-item"
              );
              tracker.remainingPlayers[player.num - 1].classList.add(
                "removed-item"
              );
              setTimeout(
                () =>
                  tracker.remainingPlayers[
                    player.num - 1
                  ].parentNode.removeChild(
                    tracker.remainingPlayers[player.num - 1]
                  ),
                1000
              );
            }
            return remains;
          }
        });
        // console.log(remainingByRound);
        console.log("eliminated");
        console.log(eliminated);
        // Ensure at least some players remain, else do it again
        if (day >= 5) {
          // only select one person
          const winningIndex = randomizerBySeed(remainingByRound.length - 1);
          remainingByRound = remainingByRound.filter((player, i) => {
            const remains = i == winningIndex;
            if (!remains) {
              eliminated.push(player);
              // add to eliminated list
              tracker.eliminatedPlayers[player.num - 1].classList.remove(
                "removed-item"
              );
              tracker.remainingPlayers[player.num - 1].classList.add(
                "removed-item"
              );
              setTimeout(
                () =>
                  tracker.remainingPlayers[
                    player.num - 1
                  ].parentNode.removeChild(
                    tracker.remainingPlayers[player.num - 1]
                  ),
                1000
              );
            }
            return remains;
          });
          // TODO: Run winner sequence
        }

        runGame(day + 1);
      }, 2000);
    })(0);

    // frame.textContent = "Remaining Players: ";
    // frame.insertAdjacentHTML(
    //   "beforeend",
    //   `${remainingByRound.map((player) => `<li>${player}</li>`)}`
    // );

    // render winning message
    return;
    // IGNORE THIS BELOW
  } catch (e) {
    console.log(e);
    // Render refresh request
    document.querySelector(".frame").insertAdjacentHTML(
      "afterbegin",
      `<h3>The HicDex API recieved too many requests. This happens from time to time. Please wait 20 seconds to refresh</h3>
        `
    );
    // setTimeout(run(creatorAddress, tag), 20000);
  }
};

// Set creator info and run program

const creatorAddress = "tz1gsR67rvm99Cuh1EtqxwSnoKwvtzEMaTS5";
const searchTag = "goldframe1"; //6830F83F7F fc43d9f93a3bb
const threshold = 4;
run(creatorAddress, searchTag, threshold).catch();
