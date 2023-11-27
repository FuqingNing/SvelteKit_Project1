export function initializeBoard(rows: number, columns: number,board: Array<Array<{ hasMine: boolean; status: string }>>,mineCount: number) {
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