import {SnowMatrix} from "game/snow/snow-matrix";
import {MATRIX_FALLING_CELLS_PER_CALC} from "game/config";
import {SnowGroundingCalc} from "game/snow/physics/snow-grounding-calc";
import {SnowMatrixTransform} from "game/snow/snow-matrix-transform";

export class SnowGravityCalc {
	constructor(
		private readonly matrix: SnowMatrix,
		private readonly matrixTransform: SnowMatrixTransform
	) {
	}

	calc(): boolean {
		let hasChanges = false;

		const mat = this.matrix.matrix;
		const fillMapYX = this.matrix.getFillMapYX();
		const fillMapY = this.matrix.getFillMapY();
		const maxY = this.matrix.rows - 1;

		for (let y = this.matrix.rows - 2; y >= 0; y--) {
			if (!fillMapY[y]) {
				continue;
			}

			const fillMapX = fillMapYX[y];
			const lineX = mat[y];

			for (let x = 0; x < this.matrix.cols; x++) {
				if (!fillMapX[x]) {
					continue;
				}

				const lineZ = lineX[x];

				for (let z = 0; z < this.matrix.levels; z++) {
					const cell = lineZ[z];

					if (cell === null) {
						continue;
					}

					if (cell.groundingVersion !== SnowGroundingCalc.version) {
						const toY = Math.min(maxY, y + MATRIX_FALLING_CELLS_PER_CALC);
						this.matrixTransform.setCell(toY, x, z, cell);

						for (let y2 = toY - 1; y2 >= y; y2--) {
							this.matrixTransform.setCell(y2, x, z, null);
						}
						hasChanges = true;
					}
				}
			}
		}

		if (hasChanges) {
			this.matrix.resetCache();
		}

		return hasChanges;
	}
}