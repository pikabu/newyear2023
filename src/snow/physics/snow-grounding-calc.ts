import {SnowMatrix} from "game/snow/snow-matrix";

type FillFlags = {
	yDirection: number;
	needChangeDirection: boolean;
}

export class SnowGroundingCalc {
	static version = 2;

	constructor(private readonly matrix: SnowMatrix) {

	}

	calc() {
		SnowGroundingCalc.version = (SnowGroundingCalc.version + 1) % 1000000;

		this.markGroundCells();

		this.fillYRay(this.matrix.rows - 2, -1);
	}

	private markGroundCells(): void {
		// get ground layer
		const lineX = this.matrix.matrix[this.matrix.rows - 1];

		for (let x = 0; x < this.matrix.cols; x++) {
			const lineZ = lineX[x];

			for (let z = 0; z < this.matrix.levels; z++) {
				const cell = lineZ[z];

				if (cell !== null) {
					cell.groundingVersion = SnowGroundingCalc.version;
				}
			}
		}
	}

	private fillYRay(y0: number, step: number): void {
		const mat = this.matrix.matrix;
		const fillMapY = this.matrix.getFillMapY();
		const fillMapYX = this.matrix.getFillMapYX();

		for (let y = y0; y < this.matrix.rows && y >= 0; y += step) {
			if (!fillMapY[y]) {
				break;
			}

			const lineX = mat[y];
			const fillMapX = fillMapYX[y];
			let changes = 0;

			const flags: FillFlags = {yDirection: step, needChangeDirection: false};

			for (let x = 0; x < this.matrix.cols; x++) {
				if (!fillMapX[x]) {
					continue;
				}

				const lineZ = lineX[x];

				for (let z = 0; z < this.matrix.levels; z++) {
					const cell = lineZ[z];
					if (cell === null || cell.groundingVersion === SnowGroundingCalc.version) {
						continue;
					}

					const parentCell = mat[y + (-step)][x][z];
					if (parentCell && parentCell.groundingVersion === SnowGroundingCalc.version) {
						cell.groundingVersion = SnowGroundingCalc.version;
						changes++;
						changes += this.fillXRay(y, x + 1, z, 1, flags);
						changes += this.fillXRay(y, x - 1, z, -1, flags);
					}
				}
			}

			if (flags.needChangeDirection) {
				this.fillYRay(y + (-step), -step);
			}

			if (changes === 0) {
				break;
			}
		}
	}

	private fillXRay(y: number, x0: number, z: number, step: number, flags: FillFlags): number {
		const mat = this.matrix.matrix;
		const fillMapX = this.matrix.getFillMapYX()[y];
		const lineX = this.matrix.matrix[y];
		let changes = 0;

		for (let x = x0; x < this.matrix.cols && x >= 0; x += step) {
			if (!fillMapX[x]) {
				break;
			}

			const cell = lineX[x][z];
			if (cell === null || cell.groundingVersion === SnowGroundingCalc.version) {
				break;
			}

			cell.groundingVersion = SnowGroundingCalc.version;
			changes++;

			if (!flags.needChangeDirection) {
				const parentCell = mat[y + (-flags.yDirection)][x][z];
				if (parentCell && parentCell.groundingVersion !== SnowGroundingCalc.version) {
					flags.needChangeDirection = true;
				}
			}

			const lineZ = lineX[x];
			let cell2 = lineZ[z + 1];
			if (cell2 && cell2.groundingVersion !== SnowGroundingCalc.version) {
				changes += this.fillZRay(y, x0, z + 1, 1, flags);
			}

			cell2 = lineZ[z - 1];
			if (cell2 && cell2.groundingVersion !== SnowGroundingCalc.version) {
				changes += this.fillZRay(y, x0, z - 1, -1, flags);
			}
		}

		return changes;
	}

	private fillZRay(y: number, x: number, z0: number, step: number, flags: FillFlags): number {
		const mat = this.matrix.matrix;
		const lineX = mat[y];
		const lineZ = lineX[x];
		let changes = 0;

		for (let z = z0; z < this.matrix.levels && z >= 0; z += step) {
			const cell = lineZ[z];
			if (cell === null || cell.groundingVersion === SnowGroundingCalc.version) {
				break;
			}

			cell.groundingVersion = SnowGroundingCalc.version;
			changes++;

			if (!flags.needChangeDirection) {
				const parentCell = mat[y + (-flags.yDirection)][x][z];
				if (parentCell && parentCell.groundingVersion !== SnowGroundingCalc.version) {
					flags.needChangeDirection = true;
				}
			}

			let cell2 = lineX[x + 1]?.[z];
			if (cell2 && cell2.groundingVersion !== SnowGroundingCalc.version) {
				changes += this.fillXRay(y, x + 1, z, 1, flags);
			}

			cell2 = lineX[x - 1]?.[z];
			if (cell2 && cell2.groundingVersion !== SnowGroundingCalc.version) {
				changes += this.fillXRay(y, x - 1, z, -1, flags);
			}
		}

		return changes;
	}
}