import { useState, useEffect, FormEvent } from 'react';
import '../styles/Home.scss';
import api from '../services/api';
import Modals from '../components/Modals';

type PlayerRanking = {
  position: number;
  email: string;
  score: number;
};

type ShipType = {
  name: string;
  size: number;
};

type Orientation = 'H' | 'V';  // H: Horizontal, V: Vertical

type Board = boolean[][];

type ShipPlacement = {
  [key: string]: string;  // chave no formato "row-col", valor é o tipo de navio
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

const initializeBoard = (size: number, ships: ShipType[]): [Board, ShipPlacement] => {
  const board: Board = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );
  const shipPlacement: ShipPlacement = {};

  ships.forEach(ship => {
    let placed = false;
    while (!placed) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      const orientation: Orientation = Math.random() > 0.5 ? 'H' : 'V';

      if (canPlaceShip(row, col, ship.size, orientation, board, size)) {
        for (let i = 0; i < ship.size; i++) {
          const posX = row + (orientation === 'V' ? i : 0);
          const posY = col + (orientation === 'H' ? i : 0);
          board[posX][posY] = true;
          shipPlacement[`${posX}-${posY}`] = ship.name;
        }
        placed = true;
      }
    }
  });

  return [board, shipPlacement];
};

const canPlaceShip = (row: number, col: number, size: number, orientation: Orientation, board: Board, boardSize: number): boolean => {
  for (let i = 0; i < size; i++) {
    const eixox = row + (orientation === 'V' ? i : 0);
    const eixoy = col + (orientation === 'H' ? i : 0);
    if (eixox >= boardSize || eixoy >= boardSize || board[eixox][eixoy]) return false;
  }
  return true;
};

const getShipTypeByPosition = (row: number, col: number, shipPlacement: ShipPlacement): string | undefined => {
  return shipPlacement[`${row}-${col}`];
};
type ShipSizes = {
  [key: string]: number;
};

const shipSizes: ShipSizes = {
  Submarine: 1,
  Destroyer: 2,
  Cruiser: 3,
  Battleship: 4,
  Carrier: 5
};

type ShipScores = {
  [key: string]: number;
};

const shipScores: ShipScores = {
  Submarine: 50,
  Destroyer: 100,
  Cruiser: 150,
  Battleship: 200,
  Carrier: 250
};

export default function Home() {
  const [ships] = useState<ShipType[]>([
    { name: 'Submarine', size: 1 },
    { name: 'Destroyer', size: 2 },
    { name: 'Destroyer', size: 2 },
    { name: 'Cruiser', size: 3 },
    { name: 'Battleship', size: 4 },
    { name: 'Carrier', size: 5 }
  ]);
  const [email, setEmail] = useState('');
  const [, setGameOver] = useState(false);
  const [board, setBoard] = useState<Board>([]);
  const [shipPlacement, setShipPlacement] = useState<ShipPlacement>({});
  const [attacks, setAttacks] = useState<Record<string, boolean>>({});
  const [rankings, setRankings] = useState<PlayerRanking[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [score, setScore] = useState(1000);  // Pontuação inicial
  const [hitsPerShip, setHitsPerShip] = useState<Record<string, number>>({
    Submarine: 0,
    Destroyer: 0,
    Cruiser: 0,
    Battleship: 0,
    Carrier: 0
  });

  const toggleRules = () => {
    setShowRules(!showRules);
  };

  const checkGameOver = () => {
    const totalHitsNeeded = ships.reduce((total, ship) => total + shipSizes[ship.name], 0);
    const currentHits = Object.values(hitsPerShip).reduce((total, numHits) => total + numHits, 1);

    if (currentHits >= totalHitsNeeded) {
      setGameOver(true);
      setShowScoreModal(true);  // Exibir modal de pontuação final
    }
  };

  const resetGame = () => {
    const [newBoard, newShipPlacement] = initializeBoard(10, ships);
    setBoard(newBoard);
    setShipPlacement(newShipPlacement);
    setAttacks({});
    setHitsPerShip({
      Submarine: 0,
      Destroyer: 0,
      Cruiser: 0,
      Battleship: 0,
      Carrier: 0
    });
    setScore(1000);
    setShowScoreModal(false);
    setShowRules(false);
    setGameOver(false);
  };
  

  useEffect(() => {
    const [newBoard, newShipPlacement] = initializeBoard(10, ships);
    setBoard(newBoard);
    setShipPlacement(newShipPlacement);
    handleGetTopPlayers();
  }, [ships]);

  async function addNewScore(event: FormEvent) {
    event.preventDefault();  // Prevenir o comportamento padrão do formulário
    try {
      const response = await api.post('/ranking/add-new-score', {
        email: email.toLowerCase(),
        score
      });
      console.log(response.data);

      if (response.data.id) {
        alert('Sua pontuação foi registrada com sucesso!');
        resetGame();
        handleGetTopPlayers();
      } else {
        alert('Falha ao registrar a pontuação. Tente novamente.');
      }
    } catch (error) {
      console.error("Erro ao adicionar pontuação", error);
      alert('Ocorreu um erro ao adicionar sua pontuação.');
    }
  }


  const handleGetTopPlayers = async () => {
    try {
      const response = await api.get('/ranking/retrieve-top-players');
      console.log(response)
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
      const isHit = board[row][col];
      const newAttacks = {
        ...attacks,
        [posKey]: isHit
      };
      setAttacks(newAttacks);

      setScore(prev => prev - 10); // Reduz 10 pontos por movimento

      if (isHit) {
        const shipType = getShipTypeByPosition(row, col, shipPlacement);
        if (shipType && shipType in shipSizes) {
          const updatedHits = (hitsPerShip[shipType] || 0) + 1;
          setHitsPerShip(prev => ({
            ...prev,
            [shipType]: updatedHits
          }));

          if (updatedHits === shipSizes[shipType]) {
            setScore(prev => prev + shipScores[shipType]);
          }

          checkGameOver();  // Chama a verificação após cada atualização de estado
        }
      }

    }
  };

  return (
    <div className="wrapper">
      <Modals show={showScoreModal} onClose={() => setShowScoreModal(false)}>
        <h1>Fim de Jogo!</h1>
        <br />
        <h3>Sua pontuação final é: {score}</h3>
        <p>Por favor, insira seu e-mail para entrar no ranking.</p><br />
        <form onSubmit={addNewScore} className='form-ranking'>
          <input
            type='email'
            className='input-ranking'
            placeholder='e-mail'
            value={email}
            onChange={
              (event) => setEmail(event.target.value)
            }
            required
          />
          <button type="submit" className='submit-ranking' >Enviar</button>
        </form>
      </Modals>

      <Modals show={showRules} onClose={toggleRules}>
        <h2>Regras do Jogo</h2>
        <br />
        <p>Para achar as embarcações é necessário clicar nos blocos azuis. Ao localiza-las, o bloco se tornará vermelho.</p>
        <p>Ao todo, existem seis (6) embarcações, sendo elas:</p>
        <br />
        <ul>
          <li>1 - Submarino (1 bloco)</li>
          <li>2 - Rebocador (2 blocos)</li>
          <li>3 - Rebocador (2 blocos)</li>
          <li>4 - Contratorpedeiro (3 blocos)</li>
          <li>5 - Cruzador (4 blocos)</li>
          <li>6 - Porta-aviões (5 blocos)</li>
        </ul>
      </Modals>

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
        <div className='info'>
          <button onClick={toggleRules} className='info-button'>Mostrar Regras</button>
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
