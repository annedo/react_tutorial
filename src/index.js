import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
      <button className="square" 
              data-row={props.rowIndex} 
              data-col={props.colIndex}>
        {props.value}
      </button>
    );
}

function BoardRow(props) {
  return <div className="board-row">{props.squares}</div>
}

class Board extends React.Component {
  renderBoard(squaresArray) {
    let board = [];
    for (let row=0; row<squaresArray.length; row++) {
      board.push(this.renderRow(row));
    }
    return board;
  }

  renderRow(rowIndex) {
    const rowArray = this.props.squares[rowIndex];
    let squareElements = [];

    for (let colIndex=0; colIndex<rowArray.length; colIndex++) {
      let square = this.renderSquare(rowIndex, colIndex);
      squareElements.push(square);
    }

    return (
      <BoardRow squares={squareElements} key={"row" + rowIndex}/>
    );
  }

  renderSquare(rowIndex, colIndex) {
    return (
      <Square
        value={this.props.squares[rowIndex][colIndex]} 
        key= {colIndex + ", " + rowIndex}
        rowIndex={rowIndex}
        colIndex={colIndex}
      />
    );
  }

  render() {
    return (
      <div className="game-board" onClick= {this.props.onClick}>
        {this.renderBoard(this.props.squares)}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(3).fill(null).map(() => Array(3).fill(null)),
        lastMove: null,
      }],
      stepNumber: 0,
      xIsNext: true,
    }
  }

  handleClick(clickedSquare) {
    let square = { "value": clickedSquare.innerText,
                   "row": parseInt(clickedSquare.getAttribute("data-row")),
                   "col": parseInt(clickedSquare.getAttribute("data-col"))
                  }
    // Slicing history removes future moves after jumping back in time
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const currentArr = history[history.length - 1].squares;
    let currSquares = [];

    for (let i=0, row; row=currentArr[i]; i++) {
      currSquares.push(row.slice());
    }

    console.log(currSquares);

    if (calculateWinner(currSquares) || square.value) {
      return;
    }

    // Set square value and update board state
    currSquares[square.row][square.col] = this.state.xIsNext ? "X": "O";
    this.setState({
      history: history.concat([{
        squares: currSquares,
        lastMove: "("+ (square.row + 1) + "," + (square.col + 1) +")",
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const moves = history.map((step, move, history) => {
      const desc = move ?
        'Go to move #' + move + " " + step.lastMove :
        'Go to game start';

      return (
        <li key={move}>
          <button style={move===this.state.stepNumber ? {"fontWeight": "bold",} : {"fontWeight": "normal",}} 
                  onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <Board squares={current.squares} onClick={(event) => this.handleClick(event.target)}/>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  function isWinnerLine(element, index, array) {
    return (element != null && element === array[0]);
  }
  // All winning combinations
  // 3 straight row, 3 straight col, 2 diagonal
  let ldiag = [squares[0][0], squares[1][1], squares[2][2]];
  let rdiag = [squares[0][2], squares[1][1], squares[2][0]];
  let allLines = [ldiag, rdiag];
  for (let i=0; i < squares.length; i++) {
    let row = squares[i];
    let col = [squares[0][i], squares[1][i], squares[2][i]];
    allLines.push(row);
    allLines.push(col);
  }
  
  for (let i=0, lineArr; lineArr = allLines[i]; i++) {
    if (lineArr.every(isWinnerLine)) {
      return lineArr[0];
    }
  }
  return null;
}

// ========================================

ReactDOM.render(
  <Game />,

  document.getElementById('root')
);
