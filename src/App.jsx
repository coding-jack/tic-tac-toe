import { useState } from "react";

// Helper to get (row, col) from move index
function getMoveLocation(prevSquares, nextSquares) {
  for (let i = 0; i < prevSquares.length; i++) {
    if (prevSquares[i] !== nextSquares[i]) {
      return [Math.floor(i / 3) + 1, (i % 3) + 1];
    }
  }
  return null;
}


export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [moveLocations, setMoveLocations] = useState([]); // stores [row, col] for each move
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    // Find move location
    const prevSquares = history[currentMove];
    const loc = getMoveLocation(prevSquares, nextSquares);
    setMoveLocations([...moveLocations.slice(0, currentMove), loc]);
  }
  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }
  // Prepare moves with location and description
  const moves = history.map((squares, move) => {
    let description;
    let loc = move > 0 ? moveLocations[move - 1] : null;
    if (move > 0) {
      description = `Go to move #${move}`;
      if (loc) {
        description += ` (${loc[0]}, ${loc[1]})`;
      }
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)} style={{fontWeight: move === currentMove ? 'bold' : 'normal'}}>{description}</button>
      </li>
    );
  });
  // Sort moves as per toggle
  const sortedMoves = isAscending ? moves : [...moves].reverse();

  // For draw detection
  const winnerInfo = calculateWinner(currentSquares);
  const isDraw = !winnerInfo && currentSquares.every(Boolean);

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} winnerInfo={winnerInfo} />
      </div>
      <div className="game-info">
        <button onClick={() => setIsAscending(!isAscending)}>
          Sort: {isAscending ? 'Ascending' : 'Descending'}
        </button>
        <ol>{sortedMoves}</ol>
        {isDraw && <div className="draw-message">The game is a draw!</div>}
      </div>
    </div>
  );
}

function Board({ xIsNext, squares, onPlay, winnerInfo }) {
  function handleClick(i) {
    if (squares[i] || (winnerInfo && winnerInfo.winner)) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares);
  }
  let status;
  if (winnerInfo && winnerInfo.winner) {
    status = "Winner: " + winnerInfo.winner;
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  // Generate board with two loops
  const boardRows = [];
  for (let row = 0; row < 3; row++) {
    const squaresInRow = [];
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col;
      const isWinning = winnerInfo && winnerInfo.line && winnerInfo.line.includes(idx);
      squaresInRow.push(
        <Square
          key={idx}
          value={squares[idx]}
          onSquareClick={() => handleClick(idx)}
          highlight={isWinning}
        />
      );
    }
    boardRows.push(
      <div className="board-row" key={row}>
        {squaresInRow}
      </div>
    );
  }

  return (
    <>
      <div className="status">{status}</div>
      {boardRows}
    </>
  );
}

function Square({ value, onSquareClick, highlight }) {
  return (
    <button
      className={"square" + (highlight ? " highlight" : "")}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return null;
}