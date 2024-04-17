import { useState, useEffect } from 'react';
import '../styles/Home.scss';
import api from '../services/api';

type PlayerRanking = {
  position: number;
  email: string;
  score: number;
};

interface User {
  id: string;
  email: string;
}

interface GameRecord {
  id: string;
  score: number;
  gameDate: string;
  userId: string;
  user: User;
}

type Board = boolean[][];

const initializeBoard = (size: number, shipsCount: number): Board => {
  const board: Board = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );

  let placedShips = 0;
  while (placedShips < shipsCount) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    if (!board[row][col]) {
      board[row][col] = true;
      placedShips++;
    }
  }
  return board;
};

export default function Home() {
  const [board, setBoard] = useState<Board>([]);
  const [attacks, setAttacks] = useState<Record<string, boolean>>({});
  const [rankings, setRankings] = useState<PlayerRanking[]>([]);

  useEffect(() => {
    setBoard(initializeBoard(10, 15));
    handleGetTopPlayers();
  }, []);

  const handleGetTopPlayers = async () => {
    try {
      const response = await api.get('/ranking/retrieve-top-players');
      const players = response.data.map((player: GameRecord, index: number) => ({
        position: index + 1,
        email: player.user.email,
        score: player.score
      }));
      setRankings(players);
    } catch (error) {
      console.error("Failed to fetch players", error);
    }
  };

  const handleBlockClick = (row: number, col: number): void => {
    const posKey = `${row}-${col}`;
    if (!(posKey in attacks)) {
      setAttacks({
        ...attacks,
        [posKey]: board[row][col]
      });
    }
  };

  return (
    <div className="wrapper">
      <div className="wrapper-ranking">
        <div className="ranking">
          <h1>Ranking</h1>
          <table>
            <thead>
              <tr>
                <th>Posição</th>
                <th>Email</th>
                <th>Pontos</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((rank, index) => (
                <tr key={index}>
                  <td>{rank.position.toString().padStart(2, '0')}</td>
                  <td>{rank.email}</td>
                  <td>{rank.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="wrapper-jogo">
        <div className="jogo">
          <div className="grid">
            {board.map((row, rowIndex) => (
              row.map((hasShip, colIndex) => {
                const posKey = `${rowIndex}-${colIndex}`;
                const isHit = posKey in attacks;
                const isShip = hasShip && isHit;
                const isMiss = !hasShip && isHit;
                return (
                  <div
                    key={posKey}
                    className={`bloco ${isShip ? 'hit' : ''} ${isMiss ? 'miss' : ''}`}
                    onClick={() => handleBlockClick(rowIndex, colIndex)}
                  ></div>
                );
              })
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
