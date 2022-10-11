"use strict";
const boardEl = document.getElementById("board");
const messagesEl = document.getElementById("messages");
const turnDisplayEl = document.getElementById("turn-display");
const startGameEl = document.getElementById("start-game");
const gameScreenEl = document.getElementById("game-screen");
const splashScreenEl = document.getElementById("splash-screen");
const gameOverScreenEl = document.getElementById("game-over-screen");
const playerOneEl = document.getElementById("player-one-input");
const playerTwoEl = document.getElementById("player-two-input");
const winnerDisplayEl = document.getElementById("winner-display");
const resetGameEl = document.getElementById("reset");
const instructionsBtnEl = document.getElementById("open-instructions");
const instructionsEl = document.getElementById("instructions");
const colorSelectEl = document.getElementById("color-form");
const modeSelectEl = document.getElementById("mode-form");
const capturedWhitePiecesEl = document.getElementById("captured-white-pieces");
const capturedBlackPiecesEl = document.getElementById("captured-black-pieces");
const playerOneTimerEl = document.getElementById("player-one-timer");
const playerTwoTimerEl = document.getElementById("player-two-timer");
let isGameOver = false;
let isPlayerOnesTurn = false;
let selectedPiece = null;
let selectPath = null;
let moveRequestSquare = null;
let requestPath = null;
let isTryingMove = false;
let errorTimer = null;
let playerOne = null;
let playerTwo = null;
let color = null;
let mode = null;
let timerOneInterval = null;
let timerTwoInterval = null;
let playerOneTimer = 60000;
let playerTwoTimer = 60000;
let blackTakenPieces = [];
let whiteTakenPieces = [];
const whitePiecePaths = [
  "./chess-piece-images/white-rook.png",
  "./chess-piece-images/white-knight.png",
  "./chess-piece-images/white-bishop.png",
  "./chess-piece-images/white-queen.png",
  "./chess-piece-images/white-king.png",
  "./chess-piece-images/white-pawn.png",
];
const blackPiecePaths = [
  "./chess-piece-images/black-rook.png",
  "./chess-piece-images/black-knight.png",
  "./chess-piece-images/black-bishop.png",
  "./chess-piece-images/black-queen.png",
  "./chess-piece-images/black-king.png",
  "./chess-piece-images/black-pawn.png",
];
instructionsBtnEl.addEventListener("click", () => {
  instructionsEl.classList.toggle("hidden");
});
resetGameEl.addEventListener("click", () => {
  clearInterval(timerOneInterval);
  clearInterval(timerTwoInterval);
  switchScreen(splashScreenEl);
  playerTwoEl.value = "";
  playerOneEl.value = "";
  boardEl.innerHTML = "";
  isGameOver = false;
  isPlayerOnesTurn = false;
  selectedPiece = null;
  selectPath = null;
  moveRequestSquare = null;
  requestPath = null;
  isTryingMove = false;
  errorTimer = null;
  playerOne = null;
  playerTwo = null;
  color = null;
  mode = null;
  timerOneInterval = null;
  timerTwoInterval = null;
  playerOneTimer = 60000;
  playerOneTimerEl.innerText = playerOneTimer / 1000;
  playerTwoTimer = 60000;
  playerTwoTimerEl.innerText = playerTwoTimer / 1000;
  blackTakenPieces = [];
  whiteTakenPieces = [];
  document.body.style.backgroundColor = "#024059";
  setUpGame();
  updateScoreBoard();
});

const startTimers = (timerToStart) => {
  clearInterval(timerOneInterval);
  clearInterval(timerTwoInterval);
  if (timerToStart === "white") {
    timerOneInterval = setInterval(() => {
      playerOneTimer = playerOneTimer - 1000;
      playerOneTimerEl.innerText = playerOneTimer / 1000;
      if (playerOneTimer <= 0) {
        isGameOver = true;
        switchScreen(gameOverScreenEl);
        winnerDisplayEl.innerText = `${playerTwo} Wins!`;
      }
    }, 1000);
  } else if (timerToStart === "black") {
    timerTwoInterval = setInterval(() => {
      playerTwoTimer = playerTwoTimer - 1000;
      playerTwoTimerEl.innerText = playerTwoTimer / 1000;
      if (playerTwoTimer <= 0) {
        isGameOver = true;
        switchScreen(gameOverScreenEl);
        winnerDisplayEl.innerText = `${playerOne} Wins!`;
      }
    }, 1000);
  }
};

startGameEl.addEventListener("click", () => {
  if (playerOneEl.value && playerTwoEl.value) {
    if (colorSelectEl.elements["color-select-item"].value) {
      color = colorSelectEl.elements["color-select-item"].value;
      document.body.style.backgroundColor = color;
    }
    if (modeSelectEl.elements["mode-select-item"].value === "timed") {
      mode = modeSelectEl.elements["mode-select-item"].value;
      playerOneTimerEl.classList.remove("hidden");
      playerTwoTimerEl.classList.remove("hidden");
    } else {
      playerOneTimerEl.classList.add("hidden");
      playerTwoTimerEl.classList.add("hidden");
    }
    playerOne = playerOneEl.value;
    playerTwo = playerTwoEl.value;
    turnDisplayEl.innerText = `${playerOne}'s Turn (White)`;
    switchScreen(gameScreenEl);
  }
});
const switchScreen = (screenToShow) => {
  gameScreenEl.classList.add("hidden");
  gameOverScreenEl.classList.add("hidden");
  splashScreenEl.classList.add("hidden");
  screenToShow.classList.remove("hidden");
};

const updateScoreBoard = () => {
  capturedWhitePiecesEl.innerHTML = "<h3>Captured White Pieces</h3>";
  whiteTakenPieces.forEach((piece) => {
    const img = document.createElement("img");
    img.src = piece;
    capturedWhitePiecesEl.append(img);
  });
  capturedBlackPiecesEl.innerHTML = "<h3>Captured Black Pieces</h3>";
  blackTakenPieces.forEach((piece) => {
    const img = document.createElement("img");
    img.src = piece;
    capturedBlackPiecesEl.append(img);
  });
};
const addPiecesToScoreBoardArr = () => {
  if (requestPath.includes("empty")) {
    return;
  } else if (requestPath.includes("white")) {
    whiteTakenPieces.push(requestPath);
    updateScoreBoard();
  } else {
    blackTakenPieces.push(requestPath);
    updateScoreBoard();
  }
};
const checkForWinner = () => {
  let isBlackKing = false;
  let isWhiteKing = false;
  for (let i = 0; i < 64; i++) {
    const element = document.getElementById(i);
    if (element.src.includes("white-king")) {
      isWhiteKing = true;
    } else if (element.src.includes("black-king")) {
      isBlackKing = true;
    }
  }
  if (!isBlackKing || !isWhiteKing) {
    let winner = null;
    if (!isBlackKing) {
      winner = playerOne;
    }
    if (!isWhiteKing) {
      winner = playerTwo;
    }
    switchScreen(gameOverScreenEl);
    isGameOver = true;
    winnerDisplayEl.innerText = `${winner} Wins!`;
  }
};
const invalidMove = () => {
  selectedPiece.style.transform = "scale(1)";
  messagesEl.classList.remove("hidden");
  clearTimeout(errorTimer);
  errorTimer = setTimeout(() => {
    messagesEl.classList.add("hidden");
  }, 500);
  return false;
};

const movePiece = (e) => {
  if (!isTryingMove) {
    selectPath = e.composedPath()[0].attributes.src.nodeValue;
    if (selectPath === "./chess-piece-images/empty.png") {
      return;
    }
    if (blackPiecePaths.includes(selectPath) && !isPlayerOnesTurn) {
      return;
    }
    if (whitePiecePaths.includes(selectPath) && isPlayerOnesTurn) {
      return;
    }
    moveRequestSquare = null;
    selectedPiece = e.target;
    selectedPiece.style.transform = "scale(1.1)";
  } else {
    moveRequestSquare = e.target;
    requestPath = e.composedPath()[0].attributes.src.nodeValue;
    if (moveRequestSquare.id === selectedPiece.id) {
      selectedPiece.style.transform = "scale(1)";
      selectedPiece = null;
      isTryingMove = !isTryingMove;
      return;
    }
    if (whitePiecePaths.includes(selectPath) && whitePiecePaths.includes(requestPath)) {
      isTryingMove = !isTryingMove;
      invalidMove();
      return;
    }
    if (blackPiecePaths.includes(selectPath) && blackPiecePaths.includes(requestPath)) {
      isTryingMove = !isTryingMove;
      invalidMove();
      return;
    }
    if (checkMove()) {
      addPiecesToScoreBoardArr();
      moveRequestSquare.setAttribute("src", selectPath);
      selectedPiece.setAttribute("src", "./chess-piece-images/empty.png");
      selectedPiece.style.transform = "scale(1)";
      selectedPiece = null;
      checkForWinner();
      if (isGameOver) {
        return;
      }
      if (isPlayerOnesTurn) {
        startTimers("white");
        turnDisplayEl.innerText = `${playerOne}'s Turn (White)`;
      } else {
        turnDisplayEl.innerText = `${playerTwo}'s Turn (Black)`;
        startTimers("black");
      }

      isPlayerOnesTurn = !isPlayerOnesTurn;
    }
  }
  isTryingMove = !isTryingMove;
};

const whitePawnMove = () => {
  //white pawn move
  if (Number(moveRequestSquare.id) === Number(selectedPiece.id) - 8) {
    if (blackPiecePaths.includes(requestPath)) {
      invalidMove();
      return;
    }
    return true;
  } else if (
    //white pawn take
    Number(moveRequestSquare.id) === Number(selectedPiece.id) - 9 ||
    Number(moveRequestSquare.id) === Number(selectedPiece.id) - 7
  ) {
    if (!blackPiecePaths.includes(requestPath)) {
      invalidMove();
      return;
    } else {
      return true;
    }
  } else if (Number(selectedPiece.id) >= 48 && Number(selectedPiece.id) <= 55) {
    if (Number(moveRequestSquare.id) - Number(selectedPiece.id) === -16) {
      const blockerRef = document.getElementById((Number(selectedPiece.id) - 8).toString());
      if (blackPiecePaths.includes(requestPath) || !blockerRef.src.includes("empty")) {
        invalidMove();
        return;
      }
      return true;
    } else {
      invalidMove();
      return;
    }
  } else {
    invalidMove();
  }
};
const blackPawnMove = () => {
  //black pawn move
  if (Number(moveRequestSquare.id) === Number(selectedPiece.id) + 8) {
    if (whitePiecePaths.includes(requestPath)) {
      invalidMove();
      return;
    }
    return true;
  } else if (
    //black pawn take
    Number(moveRequestSquare.id) === Number(selectedPiece.id) + 9 ||
    Number(moveRequestSquare.id) === Number(selectedPiece.id) + 7
  ) {
    if (!whitePiecePaths.includes(requestPath)) {
      invalidMove();
      return;
    } else {
      return true;
    }
  } else if (Number(selectedPiece.id) >= 8 && Number(selectedPiece.id) <= 15) {
    if (Number(moveRequestSquare.id) - Number(selectedPiece.id) === 16) {
      const blockerRef = document.getElementById((Number(selectedPiece.id) + 8).toString());
      if (whitePiecePaths.includes(requestPath) || !blockerRef.src.includes("empty")) {
        invalidMove();
        return;
      }
      return true;
    } else {
      invalidMove();
      return;
    }
  } else {
    invalidMove();
  }
};

const pieceMove = (arrOfPossibleMoves) => {
  for (const possibleMove of arrOfPossibleMoves) {
    if (
      Number(moveRequestSquare.id) === Number(selectedPiece.id) - possibleMove ||
      Number(moveRequestSquare.id) === Number(selectedPiece.id) + possibleMove
    ) {
      return true;
    }
  }
  invalidMove();
};

const checkBlockers = (moves, direction) => {
  for (const move of moves) {
    const moveRef = direction ? Number(selectedPiece.id) + move : Number(selectedPiece.id) - move;
    if (
      direction
        ? moveRef > Number(selectedPiece.id) && moveRef < Number(moveRequestSquare.id)
        : moveRef < Number(selectedPiece.id) && moveRef > Number(moveRequestSquare.id)
    ) {
      const elementsInWay = document.getElementById(moveRef.toString());

      if (!elementsInWay.src.includes("empty")) {
        return false;
      }
    }
  }
  return true;
};
const checkMove = () => {
  const possibleKnightMoves = [17, 15, 6, 10];
  const possibleKingMoves = [1, 8, 9, 7];
  const possibleBishopMoves = [9, 18, 27, 36, 45, 54, 63, 7, 14, 21, 28, 35, 42, 49];
  const possibleRookMoves = [1, 2, 3, 4, 5, 6, 7, 8, 16, 24, 32, 40, 48, 56, 64];
  const possibleQueenMoves = [
    1, 2, 3, 4, 5, 6, 7, 8, 16, 24, 32, 40, 48, 56, 64, 9, 18, 27, 36, 45, 54, 63, 7, 14, 21, 28,
    35, 42, 49,
  ];
  const xPossibleMoves = [1, 2, 3, 4, 5, 6, 7];
  const yPossibleMoves = [8, 16, 24, 32, 40, 48, 56, 64];
  const modNineMoves = [0, 9, 18, 27, 36, 45, 54, 63];
  const modSevenMoves = [7, 14, 21, 28, 35, 42, 49];
  if (selectPath === "./chess-piece-images/white-pawn.png") {
    return whitePawnMove();
  } else if (selectPath === "./chess-piece-images/black-pawn.png") {
    return blackPawnMove();
  } else if (
    selectPath === "./chess-piece-images/white-knight.png" ||
    selectPath === "./chess-piece-images/black-knight.png"
  ) {
    return pieceMove(possibleKnightMoves);
  } else if (
    selectPath === "./chess-piece-images/white-king.png" ||
    selectPath === "./chess-piece-images/black-king.png"
  ) {
    return pieceMove(possibleKingMoves);
  } else if (
    selectPath === "./chess-piece-images/white-bishop.png" ||
    selectPath === "./chess-piece-images/black-bishop.png"
  ) {
    if (Number(moveRequestSquare.id) - Number(selectedPiece.id) < 0) {
      if ((Number(moveRequestSquare.id) - Number(selectedPiece.id)) % 9 === 0) {
        if (!checkBlockers(modNineMoves, false)) {
          return invalidMove();
        }
      } else {
        if (!checkBlockers(modSevenMoves, false)) {
          return invalidMove();
        }
      }
    } else {
      if ((Number(moveRequestSquare.id) - Number(selectedPiece.id)) % 9 === 0) {
        if (!checkBlockers(modNineMoves, true)) {
          return invalidMove();
        }
      } else {
        if (!checkBlockers(modSevenMoves, true)) {
          return invalidMove();
        }
      }
    }

    return pieceMove(possibleBishopMoves);
  } else if (
    selectPath === "./chess-piece-images/white-rook.png" ||
    selectPath === "./chess-piece-images/black-rook.png"
  ) {
    if (Number(moveRequestSquare.id) - Number(selectedPiece.id) < 0) {
      if (
        Number(moveRequestSquare.id) - Number(selectedPiece.id) <= -1 &&
        Number(moveRequestSquare.id) - Number(selectedPiece.id) >= -7
      ) {
        if (!checkBlockers(xPossibleMoves, false)) {
          return invalidMove();
        }
      } else if ((Number(moveRequestSquare.id) - Number(selectedPiece.id)) % 8 === 0) {
        if (!checkBlockers(yPossibleMoves, false)) {
          return invalidMove();
        }
      }
    } else {
      if (
        Number(moveRequestSquare.id) - Number(selectedPiece.id) >= 1 &&
        Number(moveRequestSquare.id) - Number(selectedPiece.id) <= 7
      ) {
        if (!checkBlockers(xPossibleMoves, true)) {
          return invalidMove();
        }
      } else if ((Number(moveRequestSquare.id) - Number(selectedPiece.id)) % 8 === 0) {
        if (!checkBlockers(yPossibleMoves, true)) {
          return invalidMove();
        }
      }
    }
    return pieceMove(possibleRookMoves);
  } else if (
    selectPath === "./chess-piece-images/white-queen.png" ||
    selectPath === "./chess-piece-images/black-queen.png"
  ) {
    // this is for a weird edge case where the Queen is on the far left is
    // going to the far right and is able to skip over pieces
    const edgeLeft = [0, 8, 16, 24, 32, 40, 48, 56];
    const edgeRight = [7, 15, 23, 31, 39, 47, 55, 63];
    if (Number(moveRequestSquare.id) - Number(selectedPiece.id) < 0) {
      if ((Number(moveRequestSquare.id) - Number(selectedPiece.id)) % 9 === 0) {
        if (!checkBlockers(modNineMoves, false)) {
          return invalidMove();
        }
      } else if ((Number(moveRequestSquare.id) - Number(selectedPiece.id)) % 8 === 0) {
        if (!checkBlockers(yPossibleMoves, false)) {
          return invalidMove();
        }
      } else if (
        (Number(moveRequestSquare.id) - Number(selectedPiece.id) === 7 &&
          edgeLeft.includes(Number(selectedPiece.id))) ||
        edgeRight.includes(Number(selectedPiece.id))
      ) {
        if (!checkBlockers(xPossibleMoves, false)) {
          return invalidMove();
        }
      } else if ((Number(moveRequestSquare.id) - Number(selectedPiece.id)) % 7 === 0) {
        if (!checkBlockers(modSevenMoves, false)) {
          return invalidMove();
        }
      }
      if (
        Number(moveRequestSquare.id) - Number(selectedPiece.id) <= -1 &&
        Number(moveRequestSquare.id) - Number(selectedPiece.id) >= -6
      ) {
        if (!checkBlockers(xPossibleMoves, false)) {
          return invalidMove();
        }
      }
    } else {
      if ((Number(moveRequestSquare.id) - Number(selectedPiece.id)) % 9 === 0) {
        if (!checkBlockers(modNineMoves, true)) {
          return invalidMove();
        }
      } else if ((Number(moveRequestSquare.id) - Number(selectedPiece.id)) % 8 === 0) {
        if (!checkBlockers(yPossibleMoves, true)) {
          return invalidMove();
        }
      } else if (
        (Number(moveRequestSquare.id) - Number(selectedPiece.id) === 7 &&
          edgeLeft.includes(Number(selectedPiece.id))) ||
        edgeRight.includes(Number(selectedPiece.id))
      ) {
        if (!checkBlockers(xPossibleMoves, true)) {
          return invalidMove();
        }
      } else if ((Number(moveRequestSquare.id) - Number(selectedPiece.id)) % 7 === 0) {
        if (!checkBlockers(modSevenMoves, true)) {
          return invalidMove();
        }
      }
      if (
        Number(moveRequestSquare.id) - Number(selectedPiece.id) >= 1 &&
        Number(moveRequestSquare.id) - Number(selectedPiece.id) <= 6
      ) {
        if (!checkBlockers(xPossibleMoves, true)) {
          return invalidMove();
        }
      }
    }
    return pieceMove(possibleQueenMoves);
  }
};

const setUpGame = () => {
  for (let i = 0; i < 64; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.addEventListener("click", movePiece);
    //this is to have the colors properly indicated on the board
    if (
      (i >= 8 && i <= 15) ||
      (i >= 24 && i <= 31) ||
      (i >= 40 && i <= 47) ||
      (i >= 56 && i <= 63)
    ) {
      tile.classList.add("different");
    }
    boardEl.append(tile);
    const addPieceToBoard = (imgPath, position) => {
      if (position.includes(i)) {
        const imgEl = document.createElement("img");
        tile.append(imgEl);
        imgEl.src = imgPath;
        imgEl.setAttribute("draggable", false);
        imgEl.setAttribute("id", i);
      }
    };
    addPieceToBoard("./chess-piece-images/black-rook.png", [0, 7]);
    addPieceToBoard("./chess-piece-images/black-knight.png", [1, 6]);
    addPieceToBoard("./chess-piece-images/black-bishop.png", [2, 5]);
    addPieceToBoard("./chess-piece-images/black-queen.png", [3]);
    addPieceToBoard("./chess-piece-images/black-king.png", [4]);
    addPieceToBoard("./chess-piece-images/black-pawn.png", [8, 9, 10, 11, 12, 13, 14, 15]);
    addPieceToBoard("./chess-piece-images/white-rook.png", [56, 63]);
    addPieceToBoard("./chess-piece-images/white-knight.png", [57, 62]);
    addPieceToBoard("./chess-piece-images/white-bishop.png", [58, 61]);
    addPieceToBoard("./chess-piece-images/white-queen.png", [59]);
    addPieceToBoard("./chess-piece-images/white-king.png", [60]);
    addPieceToBoard("./chess-piece-images/white-pawn.png", [48, 49, 50, 51, 52, 53, 54, 55]);
    addPieceToBoard(
      "./chess-piece-images/empty.png",
      [
        16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
        39, 40, 41, 42, 43, 44, 45, 46, 47,
      ]
    );
  }
};
document.addEventListener("DOMContentLoaded", setUpGame);
