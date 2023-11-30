import { writable } from 'svelte/store';
import type{Writable} from 'svelte/store';
import type { GameRender } from './gameRender';

export const isGameWon = writable(false);

export function initializeBoard(board: Array<Array<{ hasMine: boolean; status: string }>>,rows: number, columns: number,mineCount: number) {
    for (let y = 0; y < rows; y++) {
        board[y] = [];
        for (let x = 0; x < columns; x++) {
            board[y][x] = {
                hasMine: false,
                status: 'closed'
            };
        }
    }
    // random bombs placed
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
        const x = Math.floor(Math.random() * columns);
        const y = Math.floor(Math.random() * rows);
        if (!board[y][x].hasMine) {
            board[y][x].hasMine = true;
            minesPlaced++;
        }
    }
}
export function initialize(rows:number, columns:number, mineCount:number) {
    const board = [];
    for (let y = 0; y < rows; y++) {
        const row = [];
        for (let x = 0; x < columns; x++) {
            row.push({ hasMine: false, status: 'closed' });
        }
        board.push(row);
    }
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
        const x = Math.floor(Math.random() * columns);
        const y = Math.floor(Math.random() * rows);
        if (!board[y][x].hasMine) {
            board[y][x].hasMine = true;
            minesPlaced++;
        }
    }
    return board;
}

export function checkWin(board: Array<Array<{ hasMine: boolean; status: string }>>, rows: number, columns: number): boolean {
    let allNonMinesRevealed = true;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            if (board[y][x].status === 'closed' && !board[y][x].hasMine) {
                allNonMinesRevealed = false;
                break;
            }
        }
        if (!allNonMinesRevealed) {
            break;
        }
    }
    return allNonMinesRevealed;
 }
export function getAdjacentMines(board: Array<Array<{ hasMine: boolean; status: string }>>, x: number, y: number, rows: number, columns: number) {
    let count = 0;
    for (let yOffset = -1; yOffset <= 1; yOffset++) {
        for (let xOffset = -1; xOffset <= 1; xOffset++) {
            if (xOffset === 0 && yOffset === 0) continue;
            const newX = x + xOffset;
            const newY = y + yOffset;
            if (newX >= 0 && newX < columns && newY >= 0 && newY < rows) {
                if (board[newY][newX].hasMine) {
                    count++;
                }
            }
        }
    }
    return count;
}
export function toggleFlag(board: Array<Array<{ hasMine: boolean; status: string }>>, x: number, y: number,currentScore:Writable<number>) {
    if (board[y][x].status === 'closed') {
        board[y][x].status = 'flagged'; // if cell closed ,flag it
        currentScore.update((n) => n - 5);
    } else if (board[y][x].status === 'flagged') {
        board[y][x].status = 'closed'; // unflag
        currentScore.update((n) => n + 5); // update score
    }
}
export 	function revealAllMines(board: Array<Array<{ hasMine: boolean; status: string }>>, rows: number, columns: number,render:GameRender, BOMB_IMAGE_BASE64: string) {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            if (board[y][x].hasMine) {
                board[y][x].status = 'mine';
                render.createImageForCell(x, y, BOMB_IMAGE_BASE64);
            }
        }
    }
}
export function revealCell(board: Array<Array<{ hasMine: boolean; status: string }>>, x: number, y: number, rows: number, columns: number, render: GameRender,currentScore:Writable<number>) {
    // Check if the selected cell is already open; if so, return early
    if (board[y][x].status !== 'closed') {
        return;
    }
    // Set the status of the cell to open
    board[y][x].status = 'open';
    // Calculate the total number of open cells for scoring purposes
    currentScore.update((n)=>n+1); // Update the current score
    // Calculate the number of adjacent mines
    const adjacentMines = getAdjacentMines(board, x, y, rows, columns);
    // If there are adjacent mines, display the count; otherwise, recursively open adjacent cells
    if (adjacentMines > 0) {
        render.createTextForCell(x, y, adjacentMines); // Display mine count for this cell
    } else {
        // Open adjacent cells if they are within the board's bounds and not already open
        for (let yOffset = -1; yOffset <= 1; yOffset++) {
            for (let xOffset = -1; xOffset <= 1; xOffset++) {
                if (xOffset === 0 && yOffset === 0) continue; // Skip the current cell
                const newX = x + xOffset;
                const newY = y + yOffset;
                if (newX >= 0 && newX < columns && newY >= 0 && newY < rows) {
                    revealCell(board,newX,newY,rows,columns,render,currentScore); // Recursive call to open adjacent cell
                }
            }
        }
    }
}
