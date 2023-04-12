import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import styled from '@emotion/styled';
import './Home.css';

import PlayedCards from '../components/PlayedCards';
import ScoreBoard from '../components/ScoreBoard';
import SelectRang from '../components/SelectRang';
import PlayerNames from '../components/PlayerNames';
import Heading from '../components/Heading';
import Messages from '../components/Messages';
import CardsContainer from '../components/CardsContainer';

interface Props {
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
  id: number;
}

function HomePage({ socket, id }: Props) {
  // DEFINING ALL USE STATES

  const [gameStatus, setGameStatus] = useState('');

  const [name, setName] = useState('');

  const newMessage: string[] = [];
  const [messages, setMessages] = useState(newMessage);

  const newPlayers: { id: number; name: string }[] = [];
  const [players, setPlayers] = useState(newPlayers);

  const newScores: { id: number; score: number }[] = [
    { id: -1, score: 0 },
    { id: -1, score: 0 },
    { id: -1, score: 0 },
    { id: -1, score: 0 },
  ];
  const [scores, setScores] = useState(newScores);

  const newFirstHand: { rank: string; suit: string; id: number }[] = [];
  const [firstHand, setFirstHand] = useState(newFirstHand);

  const [trumpID, setTrumpID] = useState(-1);

  const newHand: { rank: string; suit: string }[] = [];
  const [hand, setHand] = useState(newHand);

  const [rang, setRang] = useState('');
  const [chooseRang, setChooseRang] = useState(false);

  const newGameState = { state: '', id: -1 };
  const [gameState, setGameState] = useState(newGameState);

  const [currentPlayer, setCurrentPlayer] = useState(-1);

  const [chosenCard, setChosenCard] = useState({ rank: '', suit: '' });

  const sampleWinners: { player1: string; player2: string } = {
    player1: '',
    player2: '',
  };

  const [winners, setWinners] = useState(sampleWinners);

  const [displayScoreBoard, setDisplayScoreBoard] = useState(false);

  // DEFINING ALL FUNCTIONS

  // returns the name of the player with the given ID
  const getNameById = (id: number) => {
    const player = players.find((player) => player.id === id);
    return player ? player.name : '';
  };

  // registers the player with the given name
  const registerPlayer = (name: string) => {
    setName(name);
    const updatedMessages =
      messages.length === 0 ? [...messages, `Good luck ${name}!`] : messages;
    setMessages(updatedMessages);
  };

  // stores the players in the state
  const storePlayers = (players: { name: string; id: number }[]) => {
    setPlayers(players);
    setScores([
      { id: players[0].id, score: 0 },
      { id: players[1].id, score: 0 },
      { id: players[2].id, score: 0 },
      { id: players[3].id, score: 0 },
    ]);
    setGameState({ state: 'start', id: -1 });
  };

  // when the game starts, the player with the highest card will choose the Rang
  const processFirstHand = (
    cards: { rank: string; suit: string; id: number }[],
    trumpSuitID: number
  ) => {
    console.log('Setting first round of cards');
    setFirstHand(cards);
    setTrumpID(trumpSuitID);
    setMessages([
      `${getNameById(trumpSuitID)} will choose the Rang!`,
      ...messages,
    ]);
  };

  // for the player to choose the Rang, the first 5 cards are dealt
  const processRound1 = (cards: { rank: string; suit: string }[]) => {
    setHand(cards);
    setChooseRang(true);
  };

  // the player has chosen the Rang
  const processRang = (rang: string, id: number) => {
    setRang(rang);
    setMessages([
      `${getNameById(id)} has chosen ${rang} as the Rang!`,
      ...messages,
    ]);
    const defaultHand = [
      { rank: '', suit: '', id: -1 },
      { rank: '', suit: '', id: -1 },
      { rank: '', suit: '', id: -1 },
      { rank: '', suit: '', id: -1 },
    ];
    setFirstHand(defaultHand);
    setDisplayScoreBoard(true);
  };

  // after the Rang has been chosen, the next 8 cards are dealt
  const processRound2 = (cards: { rank: string; suit: string }[]) => {
    setHand(cards);
    setMessages([`${getNameById(trumpID)} will start the game`, ...messages]);
    setCurrentPlayer(trumpID);
  };

  // if the player plays out of his/her turn
  const outOfTurn = (data: { id: number }) => {
    setMessages([
      `${getNameById(data.id)} tried to play out of turn!`,
      ...messages,
    ]);
  };

  // if the player plays an invalid card
  const invalidCard = (data: { id: number }) => {
    setMessages([
      `${getNameById(data.id)} tried to play an invalid card!`,
      ...messages,
    ]);
  };

  // if the player plays a valid card
  const validCard = (
    card: { suit: string; rank: string; id: number },
    playedID: number,
    nextPlayer: number
  ) => {
    setMessages([
      `${getNameById(playedID)} played ${card.rank} of ${
        card.suit === 'diams' ? 'diamonds' : card.suit
      }`,
      ...messages,
    ]);
    setCurrentPlayer(nextPlayer);

    // remove card from player's hand
    if (id === playedID) {
      const newHand = hand.filter(
        (c) => c.rank !== card.rank || c.suit !== card.suit
      );
      setHand(newHand);
    }

    // put the card on the table
    let newFirstHand = firstHand;
    const playerIndex = players.findIndex((player) => player.id === playedID);
    newFirstHand[playerIndex] = card;
    console.log(
      `Setting card for ${getNameById(playedID)} at index ${playerIndex} to ${
        card.rank
      } of ${card.suit}`
    );
    setFirstHand(newFirstHand);
    console.log(firstHand);
  };

  // if the round is not complete yet, do not declare a winner
  const noWinner = (nextPlayer: number) => {
    setCurrentPlayer(nextPlayer);
    setMessages([`${getNameById(nextPlayer)} will play next`, ...messages]);
  };

  // if the round is complete, declare a winner
  const roundWinner = (winner: number, nextPlayer: number) => {
    setCurrentPlayer(nextPlayer);
    setMessages([
      `${getNameById(winner)} won the round and will play next!`,
      ...messages,
    ]);

    // increment score for winner with given ID
    const newScores = scores.map((score) => {
      if (score.id === winner) {
        return { id: score.id, score: score.score + 1 };
      } else {
        return score;
      }
    });
    setScores(newScores);

    // clear the cards on the table
    setFirstHand([
      { rank: '', suit: '', id: -1 },
      { rank: '', suit: '', id: -1 },
      { rank: '', suit: '', id: -1 },
      { rank: '', suit: '', id: -1 },
    ]);
  };

  // declare the winners of the game
  const declareWinners = (index1: number, index2: number) => {
    const winner1 = getNameById(scores[index1].id);
    const winner2 = getNameById(scores[index2].id);
    console.log('winner1: ', winner1);
    console.log('winner2: ', winner2);
    socket.emit('gameOver', { player1: winner1, player2: winner2 });
    const finalWinners = {
      player1: winner1,
      player2: winner2,
    };
    setWinners(finalWinners);
    setGameState({ state: 'gameOver', id: id });
  };

  // DEFINING ALL USE EFFECTS

  useEffect(() => {
    // Getting game status
    socket.emit('getGameStatus', { id: id });

    socket.on('gameStatus', ({ data }) => {
      setGameStatus(data);
    });
    console.log(`HomePage with ID ${id} and Socket ID ${socket.id}`);

    // Getting name for the player
    console.log(`Getting name for ID ${id} and Socket ID ${socket.id}`);
    socket.emit('getName', { id: id });

    socket.on('registered', ({ name }) => {
      console.log(
        `Received registered name ${name} for ID ${id} and Socket ID ${socket.id}`
      );
      registerPlayer(name);
    });

    // getting a list of all players with their names and IDs
    socket.emit('getPlayers');
    socket.on('players', ({ players }) => {
      storePlayers(players);
    });
  }, []);

  useEffect(() => {
    // when any player leaves, move to the loading state
    if (gameStatus === 'waitingForPlayers') {
      window.location.href = '/loading';
    } else if (gameStatus === 'gameOver') {
      window.location.href = '/gameover';
    }
  }, [gameStatus]);

  useEffect(() => {
    if (gameState.state === 'start') {
      // getting the first four cards to decide who will choose the Rang
      socket.emit('getFirstHand');

      // getting the cards and the ID of the player who will choose the Rang
      socket.on('firstHand', ({ cards, trumpSuitID }) => {
        console.log('trumpSuitID: ', trumpSuitID);
        processFirstHand(cards, trumpSuitID);

        // moving to Round 1 of dealing out the cards
        setGameState({ state: 'round1', id: trumpSuitID });
      });
    } else if (gameState.state === 'round1') {
      socket.emit('getRound1Cards', { id: id });

      // getting the first 5 cards
      socket.on('handRound1', ({ cards }) => {
        processRound1(cards);
      });

      // getting the Rang chosen by the player
      socket.on('setRang', ({ rang, id }) => {
        processRang(rang, id);

        // moving to Round 2 of dealing out the cards
        setGameState({ state: 'round2', id: id });
      });
    } else if (gameState.state === 'round2') {
      socket.emit('getRound2Cards', { id: id });

      // getting the last 8 cards
      socket.on('handRound2', ({ cards }) => {
        processRound2(cards);

        // moving to the start of the game
        if (id === trumpID) {
          setGameState({ state: 'chooseCard', id: id });
        } else {
          setGameState({ state: 'startTurn', id: id });
        }
      });
    } else if (gameState.state === 'startTurn') {
      // the player with the current turn chooses a card to play
      if (id === currentPlayer) {
        socket.emit('playCard', { id: id, card: chosenCard });
      }

      // checking if the player played out of turn
      socket.on('outOfTurn', (data) => {
        console.log('outOfTurn');
        outOfTurn(data);
      });

      // checking if the player played an invalid card
      socket.on('invalidCard', (data) => {
        console.log('invalidCard');
        invalidCard(data);
        setGameState({ state: 'chooseCard', id: id });
      });

      // checking if the player played a valid card
      socket.on('playedCard', ({ card, playedID, nextPlayer }) => {
        console.log('playedCard');
        validCard(card, playedID, nextPlayer);

        // checking if this turn produced a winner for this round
        setGameState({ state: 'checkWinner', id: nextPlayer });
      });
    } else if (gameState.state === 'checkWinner') {
      socket.emit('checkWinner', { id: id });

      // checking if there is no winner for this round
      socket.on('noWinner', ({ nextPlayer }) => {
        noWinner(nextPlayer);
        if (id === nextPlayer) {
          setGameState({ state: 'chooseCard', id: nextPlayer });
        } else {
          setGameState({ state: 'startTurn', id: nextPlayer });
        }
      });

      // checking if there is a winner for this round
      socket.on('roundWinner', ({ winner, nextPlayer }) => {
        roundWinner(winner, nextPlayer);

        // move to the next round
        if (id === winner) {
          setGameState({ state: 'chooseCard', id: nextPlayer });
        } else {
          setGameState({ state: 'startTurn', id: nextPlayer });
        }
      });
    } else if (gameState.state === 'gameOver') {
      window.location.href = '/gameover';
    }
  }, [gameState]);

  useEffect(() => {
    if (scores.length === 4) {
      // check if player 1 and 3 won
      if (scores[0].score + scores[2].score > 6) {
        declareWinners(0, 2);
      }

      // check if player 2 and 4 won
      if (scores[1].score + scores[3].score > 6) {
        declareWinners(1, 3);
      }
    }
  }, [scores]);

  // DEFINING ALL ON-CLICK FUNCTIONS

  const onSelectRang = (rang: string) => {
    socket.emit('selectRang', { rang: rang, id: id });
    setChooseRang(false);
  };

  const onSelectCard = (card: { rank: string; suit: string }) => {
    if (gameState.state === 'chooseCard' && id === currentPlayer) {
      setChosenCard(card);
    }
    setGameState({ state: 'startTurn', id: id });
  };

  return (
    <Main>
      <div className="main-container playingCards">
        <div className="game-container">
          <Heading name={name} />
          <div className="game-table-container">
            <div className="game-table">
              <PlayedCards firstHand={firstHand} />
              <PlayerNames players={players} />
            </div>
          </div>

          {id === trumpID && chooseRang ? (
            <SelectRang onSelectRang={onSelectRang} />
          ) : null}

          {players.length === 4 && displayScoreBoard ? (
            <ScoreBoard players={players} scores={scores} />
          ) : null}
        </div>

        <div className="messages-and-cards-container">
          <Messages messages={messages} />
          <CardsContainer hand={hand} rang={rang} onSelectCard={onSelectCard} />
        </div>
      </div>
    </Main>
  );
}

const Main = styled.div`
  background-color: #ffffff;
`;

export default HomePage;
