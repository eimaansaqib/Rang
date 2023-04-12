const { Socket } = require('socket.io');

const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
  },
});

server.listen(3001, () => {
  console.log('SERVER IS LISTENING ON PORT 3001');
});

// declaring all the variables
const clients = new Map();
const names = new Map();
let id = 0;
let TrumpSuit = '';
let MasterDeck = [
  '2C',
  '2D',
  '2H',
  '2S',
  '3C',
  '3D',
  '3H',
  '3S',
  '4C',
  '4D',
  '4H',
  '4S',
  '5C',
  '5D',
  '5H',
  '5S',
  '6C',
  '6D',
  '6H',
  '6S',
  '7C',
  '7D',
  '7H',
  '7S',
  '8C',
  '8D',
  '8H',
  '8S',
  '9C',
  '9D',
  '9H',
  '9S',
  '10C',
  '10D',
  '10H',
  '10S',
  'JC',
  'JD',
  'JH',
  'JS',
  'QC',
  'QD',
  'QH',
  'QS',
  'KC',
  'KD',
  'KH',
  'KS',
  'AC',
  'AD',
  'AH',
  'AS',
];
let Deck = JSON.parse(JSON.stringify(MasterDeck));
let Player1: { suit: string; rank: string }[] = [];
let Player2: { suit: string; rank: string }[] = [];
let Player3: { suit: string; rank: string }[] = [];
let Player4: { suit: string; rank: string }[] = [];
let PlayedCards: { suit: string; rank: string }[] = [];
let cardPriority = new Map();
let currentPlayer = -1;

// get the suit of a card
const getSuit = (card: string) => {
  return card[card.length - 1];
};

// get the value of a card
const getValue = (card: string) => {
  return card.slice(0, -1);
};

// assign priority to each card based on its value and suit and the TrumpSuit
const assignPriority = () => {
  for (let i = 0; i < MasterDeck.length; i++) {
    let card = MasterDeck[i];
    let value = getValue(card);
    let suit = getSuit(card);
    if (value === 'A') {
      cardPriority.set(card, 14);
    } else if (value === 'K') {
      cardPriority.set(card, 13);
    } else if (value === 'Q') {
      cardPriority.set(card, 12);
    } else if (value === 'J') {
      cardPriority.set(card, 11);
    } else {
      cardPriority.set(card, parseInt(value));
    }
    if (suit === TrumpSuit) {
      cardPriority.set(card, cardPriority.get(card) + 100);
    }
  }
};

// convert suit character to its full suit name
const suitName = (card: string) => {
  const suit = getSuit(card);
  if (suit === 'C') {
    return 'clubs';
  } else if (suit === 'D') {
    return 'diams';
  } else if (suit === 'H') {
    return 'hearts';
  } else {
    return 'spades';
  }
};

// deterministically break the tie if more than one cards have the same priority
const breakTie = (cards: string[]) => {
  cards.sort((a, b) => {
    return getSuit(a).localeCompare(getSuit(b));
  });
  return cards[0];
};

// shuffle the deck
const shuffle = (array: string[]) => {
  let currentIndex = array.length;
  let randomIndex: any;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

// hand out n cards to each player
const dealCards = (n: number) => {
  for (let i = 0; i < n; i++) {
    let c1 = Deck.pop() || '';
    Player1.push({ suit: suitName(c1), rank: getValue(c1) });
    let c2 = Deck.pop() || '';
    Player2.push({ suit: suitName(c2), rank: getValue(c2) });
    let c3 = Deck.pop() || '';
    Player3.push({ suit: suitName(c3), rank: getValue(c3) });
    let c4 = Deck.pop() || '';
    Player4.push({ suit: suitName(c4), rank: getValue(c4) });
  }
};

// return ID of the player who is to choose the trump suit
const chooseTrumpSuit = (players: { id: number; card: string }[]) => {
  let max = 0;
  let maxID = 0;
  let maxCard = '';
  for (let i = 0; i < players.length; i++) {
    if (cardPriority.get(players[i].card) > max) {
      max = cardPriority.get(players[i].card);
      maxID = players[i].id;
      maxCard = players[i].card;
    } else if (cardPriority.get(players[i].card) === max) {
      maxCard = breakTie([maxCard, players[i].card]);
      if (maxCard === players[i].card) {
        maxID = players[i].id;
      }
    }
  }
  return maxID;
};

// set the trump suit
const setTrumpSuit = (suit: string) => {
  TrumpSuit = suit;
};

// return the ID of the player with the next turn
const getNextPlayer = () => {
  const allIDs = [...names.keys()];
  const index = allIDs.indexOf(currentPlayer);
  if (index === 3) {
    return allIDs[0];
  } else {
    return allIDs[index + 1];
  }
};

// verify if the move by the current player is valid
const verifyMove = (
  card: { suit: string; rank: string },
  hand: { suit: string; rank: string }[]
) => {
  const numberOfRounds = Math.floor(PlayedCards.length / 4);
  const lastRoundStart =
    PlayedCards.length % 4 === 0 ? numberOfRounds * 4 - 4 : numberOfRounds * 4;
  const suit = card.suit;
  if (PlayedCards.length % 4 !== 0) {
    if (suit !== PlayedCards[lastRoundStart].suit) {
      if (hand.some((c) => c.suit === PlayedCards[lastRoundStart].suit)) {
        return 0;
      }
    }
  }
  PlayedCards.push(card);
  currentPlayer = getNextPlayer();
  return 1;
};

// play a card from a player's hand
const playCard = (card: { suit: string; rank: string }, id: number) => {
  if (id === currentPlayer) {
    const rank = card.rank;
    const suit = card.suit;
    const allIDs = [...names.keys()];
    if (id === allIDs[0]) {
      const result = verifyMove(card, Player1);
      if (result === 1) {
        Player1 = Player1.filter((c) => c.rank !== rank || c.suit !== suit);
      }
      return result;
    }
    if (id === allIDs[1]) {
      const result = verifyMove(card, Player2);
      if (result === 1) {
        Player2 = Player2.filter((c) => c.rank !== rank || c.suit !== suit);
      }
      return result;
    }
    if (id === allIDs[2]) {
      const result = verifyMove(card, Player3);
      if (result === 1) {
        Player3 = Player3.filter((c) => c.rank !== rank || c.suit !== suit);
      }
      return result;
    }
    if (id === allIDs[3]) {
      const result = verifyMove(card, Player4);
      if (result === 1) {
        Player4 = Player4.filter((c) => c.rank !== rank || c.suit !== suit);
      }
      return result;
    }
  }
  return -1;
};

// convert card object to string
const cardToString = (card: { suit: string; rank: string }) => {
  let rank = card.rank;
  let suit = card.suit.charAt(0).toUpperCase();
  return rank + suit;
};

// return the ID of the player who won the round, return -1 if the round is not over
const getRoundWinner = () => {
  if (PlayedCards.length % 4 === 0 && PlayedCards.length !== 0) {
    let max = -1;
    let maxID = 0;
    let maxCard = '';
    const sliced = PlayedCards.slice(-4);
    const allIDs = [...names.keys()];
    const index = allIDs.indexOf(currentPlayer);
    for (let i = 0; i < sliced.length; i++) {
      const playerID = allIDs[(index + i) % 4];
      const cardString = cardToString(sliced[i]);
      const priority = cardPriority.get(cardString);
      if (priority > max) {
        max = priority;
        maxID = playerID;
        maxCard = cardString;
      } else if (priority === max) {
        maxCard = breakTie([maxCard, cardString]);
        if (maxCard === cardString) {
          maxID = playerID;
        }
      }
    }
    return maxID;
  }
  return -1;
};

// get an unused ID to assign to a new client
const assignID = () => {
  let newID = -1;
  for (const [socket, id] of clients) {
    if (id > newID) {
      newID = id;
    }
  }
  newID++;
  return newID;
};

// get socket corresponding to an ID
const getSocketByID = (id: number) => {
  for (const [socket, socketID] of clients) {
    if (socketID === id) {
      return socket;
    }
  }
  return null;
};

// get name corresponding to an ID
const getNameByID = (id: number) => {
  for (const [socketID, name] of names) {
    if (socketID === id) {
      return name;
    }
  }
  return 'Anonymous';
};

// emit an event to all registered players
const broadcast = (event: string, data: any) => {
  for (const [socket, id] of clients) {
    socket.emit(event, data);
  }
};

// broadcast the game status to all registered players
const broadcastGameStatus = () => {
  if (winners[0] !== '' && winners[1] !== '') {
    broadcast('gameStatus', { data: `gameOver` });
  } else if (names.size < 4) {
    broadcast('gameStatus', { data: `waitingForPlayers` });
  } else if (names.size === 4) {
    broadcast('gameStatus', { data: `startGame` });
  } else {
    broadcast('gameStatus', { data: `tooManyPlayers` });
  }
};

let round1Dealt = false;
let round2Dealt = false;
let openCheck = false;
let winners = ['', ''];
let numberOfQueries = 0;

io.on('connection', (socket: any) => {
  socket.emit('connected', { id: id });

  // add the new client to the clients map with the assigned ID
  socket.on('acceptedConnection', (data: any) => {
    for (const [socket, id] of clients) {
      if (data.id === id) {
        clients.delete(socket);
      }
    }
    clients.set(socket, data.id);
    id = assignID();
    if (
      names.size >= 4 &&
      [...names.keys()].find((id) => id === data.id) === undefined
    ) {
      socket.emit('connectionRefused', { data: 'tooManyPlayers' });
    }
    broadcastGameStatus();
  });

  socket.on('getGameStatus', (data: any) => {
    broadcastGameStatus();
  });

  // store the name of the client with the corresponding ID
  socket.on('register', (data: any) => {
    console.log(`Client ${data.id} has registered with name ${data.name}`);
    names.set(data.id, data.name);
    broadcastGameStatus();
  });

  // return the name of the client with the corresponding ID
  socket.on('getName', (data: any) => {
    socket.emit('registered', { name: getNameByID(data.id) });
    broadcastGameStatus();
  });

  // return the names and IDs of all registered clients
  socket.on('getPlayers', (data: any) => {
    let players: {}[] = [];
    for (const [socketID, name] of names) {
      players.push({ id: socketID, name: name });
    }
    socket.emit('players', { players: players });
  });

  // give one card to each player, along with the ID of the player who will choose the trump suit
  socket.on('getFirstHand', (data: any) => {
    Deck = shuffle(Deck);
    let cards = Deck.slice(0, 4);
    let firstHand = cards.map((card: string, index: number) => {
      return {
        suit: suitName(card),
        rank: getValue(card).toLowerCase(),
        id: index,
      };
    });
    let mapCards = cards.map((card: string, index: number) => {
      return { id: [...names.keys()][index], card: card };
    });
    assignPriority();
    let trumpSuitID = chooseTrumpSuit(mapCards);
    broadcast('firstHand', { cards: firstHand, trumpSuitID: trumpSuitID });
  });

  // deal the first round of 5 cards to each player
  socket.on('getRound1Cards', (data: any) => {
    if (!round1Dealt) {
      dealCards(5);
      round1Dealt = true;
    }
    let clientSocket = getSocketByID(data.id);
    let allIDs = [...names.keys()];
    let index = allIDs.indexOf(data.id);
    index === 0
      ? clientSocket.emit('handRound1', {
          cards: Player1.map((card) => {
            return { suit: card.suit, rank: card.rank.toLowerCase() };
          }),
        })
      : index === 1
      ? clientSocket.emit('handRound1', {
          cards: Player2.map((card) => {
            return { suit: card.suit, rank: card.rank.toLowerCase() };
          }),
        })
      : index === 2
      ? clientSocket.emit('handRound1', {
          cards: Player3.map((card) => {
            return { suit: card.suit, rank: card.rank.toLowerCase() };
          }),
        })
      : clientSocket.emit('handRound1', {
          cards: Player4.map((card) => {
            return { suit: card.suit, rank: card.rank.toLowerCase() };
          }),
        });
  });

  // broadcast the selected Rang to all players
  socket.on('selectRang', (data: any) => {
    TrumpSuit = data.rang.charAt(0).toUpperCase();
    assignPriority();
    broadcast('setRang', { rang: data.rang, id: data.id });
    currentPlayer = data.id;
  });

  // deal the second round of 8 cards to each player
  socket.on('getRound2Cards', (data: any) => {
    if (!round2Dealt) {
      dealCards(8);
      round2Dealt = true;
    }
    let clientSocket = getSocketByID(data.id);
    let allIDs = [...names.keys()];
    let index = allIDs.indexOf(data.id);
    index === 0
      ? clientSocket.emit('handRound2', {
          cards: Player1.map((card) => {
            return { suit: card.suit, rank: card.rank.toLowerCase() };
          }),
        })
      : index === 1
      ? clientSocket.emit('handRound2', {
          cards: Player2.map((card) => {
            return { suit: card.suit, rank: card.rank.toLowerCase() };
          }),
        })
      : index === 2
      ? clientSocket.emit('handRound2', {
          cards: Player3.map((card) => {
            return { suit: card.suit, rank: card.rank.toLowerCase() };
          }),
        })
      : clientSocket.emit('handRound2', {
          cards: Player4.map((card) => {
            return { suit: card.suit, rank: card.rank.toLowerCase() };
          }),
        });
  });

  // try to play a card by a player with the corresponding ID, and broadcast the result
  socket.on('playCard', (data: any) => {
    const playedCard = {
      suit: data.card.suit,
      rank: data.card.rank.toUpperCase(),
    };
    const playResult = playCard(playedCard, data.id);

    // -1: player played out of turn, 0: invalid card, 1: valid card
    if (playResult === -1) {
      socket.emit('outOfTurn', { id: data.id });
    } else if (playResult === 0) {
      socket.emit('invalidCard', { id: data.id });
    } else {
      openCheck = true;
      broadcast('playedCard', {
        card: data.card,
        playedID: data.id,
        nextPlayer: currentPlayer,
      });
    }
  });

  // check if a round has a winner, and broadcast the result
  socket.on('checkWinner', (data: any) => {
    numberOfQueries += 1;
    if (openCheck && numberOfQueries === 4) {
      openCheck = false;
      numberOfQueries = 0;

      // ID of the player who won the round, -1 if no winner
      const winner = getRoundWinner();

      if (winner === -1) {
        broadcast('noWinner', { nextPlayer: currentPlayer });
      } else {
        currentPlayer = winner;
        broadcast('roundWinner', { winner: winner, nextPlayer: currentPlayer });
      }
    }
  });

  // store names of the winners when the game is over
  socket.on('gameOver', (data: any) => {
    console.log('Game over');
    console.log('Winners:', data.player1 + ', ' + data.player2);
    winners = [data.player1, data.player2];
    broadcastGameStatus();
  });

  // return the names of the winners
  socket.on('getWinners', (data: any) => {
    socket.emit('announceWinners', {
      winners: winners,
    });
  });

  socket.on('disconnect', () => {
    clients.delete(socket);
    id = assignID();
    broadcastGameStatus();
  });
});
