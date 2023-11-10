<script lang="ts">
	import { writable } from 'svelte/store';

	export const board = writable<Array<Array<{ hasMine: boolean; status: string }>>>([]);

	export function initializeBoard(rows: number, columns: number, mineCount: number): void {
		const newBoard: Array<Array<{ hasMine: boolean; status: string }>> = [];
		for (let y = 0; y < rows; y++) {
			let row: Array<{ hasMine: boolean; status: string }> = [];
			for (let x = 0; x < columns; x++) {
				row.push({
					hasMine: false,
					status: 'closed'
				});
			}
			newBoard.push(row);
		}

		// Randomly place bombs
		let minesPlaced = 0;
		while (minesPlaced < mineCount) {
			const x = Math.floor(Math.random() * columns);
			const y = Math.floor(Math.random() * rows);
			if (!newBoard[y][x].hasMine) {
				newBoard[y][x].hasMine = true;
				minesPlaced++;
			}
		}

		board.set(newBoard);
	}
</script>
