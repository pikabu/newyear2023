import {SnowMatrix} from "game/snow/snow-matrix";
import {HISTORY_MAX_RECORDS} from "game/config";
import {SnowCell} from "game/snow/snow-cell";

type HistoryRecord = {
	x: number;
	y: number;
	z: number;
	cell: SnowCell | null
}

export class SnowMatrixHistory {
	isSavedToServer = true;
	private prevState: (SnowCell | null)[][][];
	private history: HistoryRecord[][] = [];

	constructor(private readonly matrix: SnowMatrix) {
		if (!('structuredClone' in window)) {
			return;
		}

		this.prevState = structuredClone(this.matrix.matrix);
	}

	reset(): void {
		this.history = [];
		this.isSavedToServer = false;
		this.prevState = structuredClone(this.matrix.matrix);
	}

	hasChanges(): boolean {
		return this.history.length > 0;
	}

	saveState(): void {
		if (!('structuredClone' in window)) {
			return;
		}

		this.isSavedToServer = false;

		const mat = this.matrix.matrix;
		const changes: HistoryRecord[] = [];

		for (let y = 0; y < this.matrix.rows; y++) {
			const lineX = mat[y];
			const lineXPrev = this.prevState[y];

			for (let x = 0; x < this.matrix.cols; x++) {
				const lineZ = lineX[x];
				const lineZPrev = lineXPrev[x];

				for (let z = 0; z < this.matrix.levels; z++) {
					const cell = lineZ[z];
					const cellPrev = lineZPrev[z];

					if (cell === null) {
						if (cellPrev !== null) {
							// cell has been removed
							lineZPrev[z] = null;
							changes.push({x, y, z, cell: cellPrev});
						}
					} else if (cellPrev === null) {
						// new cell has been removed
						lineZPrev[z] = structuredClone(cell);
						changes.push({x, y, z, cell: null});

					} else if (cell.hash !== cellPrev.hash) {
						// changed cell
						lineZPrev[z] = structuredClone(cell);
						changes.push({x, y, z, cell: cellPrev});
					}
				}
			}
		}

		console.log('save changes ', changes.length);

		this.history.push(changes);

		if (this.history.length > HISTORY_MAX_RECORDS) {
			this.history.shift();
		}
	}

	restoreState(): void {
		if (this.history.length < 1) {
			return;
		}

		this.isSavedToServer = false;

		const changes = this.history.pop();
		const matSrc = this.prevState;
		const matDst = this.matrix.matrix;

		for (const rec of changes) {
			matSrc[rec.y][rec.x][rec.z] = rec.cell;
		}

		for (let y = 0; y < this.matrix.rows; y++) {
			const lineX = matDst[y];
			const lineXPrev = matSrc[y];

			for (let x = 0; x < this.matrix.cols; x++) {
				const lineZ = lineX[x];
				const lineZPrev = lineXPrev[x];

				for (let z = 0; z < this.matrix.levels; z++) {
					const cell = lineZ[z];
					const cellPrev = lineZPrev[z];

					if (cell === null) {
						if (cellPrev !== null) {
							lineZ[z] = structuredClone(cellPrev);
						}
					} else if (cellPrev === null) {
						lineZ[z] = null;

					} else if (cell.hash !== cellPrev.hash) {
						lineZ[z] = structuredClone(cellPrev);
					}
				}
			}
		}

		this.matrix.setInitialChangedCube();
		this.matrix.resetCache();
	}
}