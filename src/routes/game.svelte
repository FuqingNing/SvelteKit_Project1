<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import * as PIXI from 'pixi.js';
	import * as game from './game';
	import { GameRender } from './gameRender';

	let app: PIXI.Application;
	let win = false;
	let gameOver = false;
	let render: GameRender;
	let currentScore = writable(0);
	let board: Array<Array<{ hasMine: boolean; status: string }>> = [];
	let boardVersion = 0;
	// constants
	const rows = 10;
	const columns = 10;
	const mineCount = 10;
	const cellSize = 50;
	const cellColor = 0x808080; // grey
	const openCellColor = 0xc0c0c0; // light grey
	// Base64 images for flag and bomb
	const FLAG_IMAGE_BASE64 =
		'data:image/png;base64,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';
	const BOMB_IMAGE_BASE64 =
		'data:image/png;base64,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';
	onMount(() => {
		app = new PIXI.Application({
			width: columns * cellSize,
			height: rows * cellSize,
			backgroundColor: 0xeeeeee
		});
		const canvasElement = app.view as HTMLCanvasElement;
		canvasElement.oncontextmenu = (e: MouseEvent) => e.preventDefault();
		document.getElementById('game-board')?.appendChild(canvasElement);

		game.initializeBoard(board, rows, columns, mineCount);
		render = new GameRender(app, cellSize);
		drawBoard();

		app.stage.interactive = !gameOver;
		app.stage.on('pointerdown', onCellClick);
	});

	function drawBoard() {
		const graphics = new PIXI.Graphics();
		// clear all children
		app.stage.removeChildren();
		const render = new GameRender(app, cellSize);
		// draw board
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < columns; x++) {
				const cell = board[y][x];
				let color; // local variable to store color
				switch (cell.status) {
					case 'closed':
						if (gameOver) {
							color = 0xff0000; // if game over, color is red
							break;
						} else {
							color = cellColor; // if cell closed, color is grey
							break;
						}
					case 'mine':
						render.createImageForCell(x, y, BOMB_IMAGE_BASE64);
						continue;
					case 'flagged':
						render.createImageForCell(x, y, FLAG_IMAGE_BASE64);
						continue;
					case 'open':
						const adjacentMines = game.getAdjacentMines(board, x, y, rows, columns);
						if (adjacentMines > 0) {
							render.createTextForCell(x, y, adjacentMines);
						}
						continue;
					default:
						color = openCellColor; //if cell open, color is light grey
						PIXI.LineStyle;
				}
				//for each cell, draw a rectangle according to the color from switch sentence
				graphics.beginFill(color);
				graphics.drawRect(x * cellSize, y * cellSize, cellSize, cellSize);
				graphics.lineStyle(1, 0x000000, 1);
				graphics.endFill();
			}
		}
		app.stage.addChild(graphics);
	}
	function onCellClick(event: any) {
		const isRightClick = event.data.button === 2; // right click
		const position = event.data.getLocalPosition(app.stage);
		const x = Math.floor(position.x / cellSize);
		const y = Math.floor(position.y / cellSize);
		if (x >= 0 && x < columns && y >= 0 && y < rows) {
			if (isRightClick) {
				toggleFlag(x, y); // right click
			} else {
				revealCell(x, y); // left click
			}
			boardVersion++; // update the board
		}
	}
	function toggleFlag(x: number, y: number) {
		//x is the column, y is the row
		if (board[y][x].status === 'closed') {
			board[y][x].status = 'flagged'; // if cell closed ,flag it
			currentScore.update((n) => n - 5);
		} else if (board[y][x].status === 'flagged') {
			board[y][x].status = 'closed'; // unflag
			currentScore.update((n) => n + 1); // update score
		}
		win = game.checkWin(board, rows, columns);
	}
	function revealCell(x: number, y: number) {
		const render = new GameRender(app, cellSize);
		if (board[y][x].status !== 'closed') {
			return;
		}
		if (board[y][x].hasMine) {
			revealAllMines();
			gameOver = true;
			return;
		}
		board[y][x].status = 'open';
		let openCells = 0;
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < columns; x++) {
				if (board[y][x].status === 'open') {
					openCells++;
				}
			}
		}
		$currentScore = openCells;
		const adjacentMines = game.getAdjacentMines(board, x, y, rows, columns);
		if (adjacentMines > 0) {
			render.createTextForCell(x, y, adjacentMines);
		} else {
			for (let yOffset = -1; yOffset <= 1; yOffset++) {
				for (let xOffset = -1; xOffset <= 1; xOffset++) {
					if (xOffset === 0 && yOffset === 0) continue;
					const newX = x + xOffset;
					const newY = y + yOffset;
					if (newX >= 0 && newX < columns && newY >= 0 && newY < rows) {
						revealCell(newX, newY);
					}
				}
			}
		}
		win = game.checkWin(board, rows, columns);
	}

	function revealAllMines() {
		// drawBoard();
		boardVersion++;
		const render = new GameRender(app, cellSize);
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < columns; x++) {
				if (board[y][x].hasMine) {
					board[y][x].status = 'mine';
					render.createImageForCell(x, y, BOMB_IMAGE_BASE64);
				}
			}
		}
	}
	function restartGame() {
		gameOver = false;
		app.stage.interactive = true;
		$currentScore = 0;
		// initializeBoard();
		game.initializeBoard(board, rows, columns, mineCount);
		// drawBoard();
		boardVersion++;
	}

	function showWinResult() {
		app.stage.interactive = false;
		let winPopup = document.getElementById('winPopup');
		let restartButton = document.getElementById('WinrestartButton');
		if (winPopup) winPopup.style.display = 'flex';
		if (restartButton) {
			restartButton.addEventListener('click', function () {
				if (winPopup) winPopup.style.display = 'none';
				restartGame();
			});
		}
	}
	function showResult() {
		app.stage.interactive = false;
		let gameOverPopup = document.getElementById('gameOverPopup');
		let restartButton = document.getElementById('restartButton');

		if (gameOverPopup) gameOverPopup.style.display = 'flex';
		if (restartButton) {
			restartButton.addEventListener('click', function () {
				if (gameOverPopup) gameOverPopup.style.display = 'none'; // hind the alart
				restartGame();
			});
		}
	}
	$: if (gameOver) {
		showResult();
	}
	$: if (win) {
		showWinResult();
	}
	$: if (boardVersion > 0) {
		drawBoard();
	}
</script>

<main>
	<div id="game-board" />
	<div id="bottom-bar">
		<p id="score">Score: <b>{$currentScore}</b></p>
	</div>
</main>

<div id="gameOverPopup" class="popup">
	<div class="popup-content">
		<h2>Game Over!</h2>
		<button id="restartButton" class="restart-button">Restart Game</button>
	</div>
</div>
<div id="winPopup" class="popup">
	<div class="popup-content">
		<h2>You Win!</h2>
		<button id="WinrestartButton" class="restart-button">Restart Game</button>
	</div>
</div>

<style>
	main {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100vh;
		background: #ecf0f1;
		font-family: 'Arial', sans-serif;
	}

	#game-board {
		flex-grow: 1;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	#bottom-bar {
		width: 100%;
		padding: 10px;
		background: #34495e;
		color: white;
		text-align: center;
	}

	.popup {
		display: none;
		position: fixed;
		left: 50%;
		top: 10px;
		transform: translateX(-50%);
		width: auto;
		max-width: 300px;
		background: rgba(255, 255, 255, 0.95);
		padding: 20px;
		border-radius: 10px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
		z-index: 1000;
	}

	.popup-content h2 {
		font-size: 20px;
		margin: 0 0 10px;
	}
	.restart-button {
		background-color: #e74c3c;
		color: white;
		padding: 10px 20px;
		border: none;
		border-radius: 25px;
		cursor: pointer;
		font-size: 18px;
		transition: all 0.3s;
		display: inline-block;
		text-decoration: none;
	}

	.restart-button:hover {
		background-color: #c0392b;
		transform: scale(1.1);
	}
</style>
