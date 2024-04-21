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

type ShipType = {
  name: string;
  size: number;
};

type Orientation = 'H' | 'V';  // H: Horizontal, V: Vertical

type Board = boolean[][];

const initializeBoard = (size: number, ships: ShipType[]): Board => {
  const board: Board = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );

  ships.forEach(ship => {
    let placed = false;
    while (!placed) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      const orientation: Orientation = Math.random() > 0.5 ? 'H' : 'V';

      if (canPlaceShip(row, col, ship.size, orientation, board, size)) {
        for (let i = 0; i < ship.size; i++) {
          if (orientation === 'H') board[row][col + i] = true;
          else board[row + i][col] = true;
        }
        placed = true;
      }
    }
  });

  return board;
};

const canPlaceShip = (row: number, col: number, size: number, orientation: Orientation, board: Board, boardSize: number): boolean => {
  for (let i = 0; i < size; i++) {
    const eixox = row + (orientation === 'V' ? i : 0);
    const eixoy = col + (orientation === 'H' ? i : 0);
    if (eixox >= boardSize || eixoy >= boardSize || board[eixox][eixoy]) return false;
  }
  return true;
};
export default function Home() {
  const [board, setBoard] = useState<Board>([]);
  const [attacks, setAttacks] = useState<Record<string, boolean>>({});
  const [rankings, setRankings] = useState<PlayerRanking[]>([]);

  useEffect(() => {
    // Definindo diferentes tipos de navios
    const ships = [
      { name: 'Submarine', size: 1 },
      { name: 'Destroyer', size: 2 },
      { name: 'Destroyer', size: 2 },
      { name: 'Cruiser', size: 3 },
      { name: 'Battleship', size: 4 },
      { name: 'Carrier', size: 5 }
    ];
    setBoard(initializeBoard(10, ships));
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
