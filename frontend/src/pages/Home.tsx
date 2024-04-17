import React, { useState, useEffect } from 'react';
import '../styles/Home.scss';

type Ranking = {
  position: number;
  email: string;
  points: number;
};

type Board = boolean[][];

// Função para inicializar o tabuleiro com navios posicionados aleatoriamente
const initializeBoard = (size: number, shipsCount: number): Board => {
  const board: Board = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );

  let placedShips = 0;
  while (placedShips < shipsCount) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);

    if (!board[row][col]) {  // Se não há navio nesta posição
      board[row][col] = true;
      placedShips++;
    }
  }

  return board;
};

export default function Home() {
  const [board, setBoard] = useState<Board>([]);
  const [attacks, setAttacks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setBoard(initializeBoard(10, 15));  // 10x10 grid com 15 navios
  }, []);

  const handleBlockClick = (row: number, col: number): void => {
    const posKey = `${row}-${col}`;
    if (!(posKey in attacks)) { // Verifica se já foi clicado
      setAttacks({
        ...attacks,
        [posKey]: board[row][col] // Armazena se havia um navio
      });
    }
  };

  const rankings: Ranking[] = Array.from({ length: 10 }, (_, index) => ({
    position: index + 1,
    email: `user${index + 1}@gmail.com`,
    points: 1000 - index * 100
  }));

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
              {rankings.map(rank => (
                <tr key={rank.position}>
                  <td>{rank.position.toString().padStart(2, '0')}</td>
                  <td>{rank.email}</td>
                  <td>{rank.points}</td>
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
