import {SnowMatrix} from "game/snow/snow-matrix";
import {MATRIX_COLS, SNOW_LIGHT_MAX_TRACE_PATH_X, SNOW_LIGHT_MAX_TRACE_PATH_Y} from "game/config";

export class SnowLightnessCalc {
	constructor(private readonly matrix: SnowMatrix) {

	}

	calc(): void {
		const mat = this.matrix.matrix;
		const fillMapYX = this.matrix.getFillMapYX();
		const fillMapY = this.matrix.getFillMapY();

		const cube = this.matrix.getChangedCubeWithRenderIndent();

		for (let y = cube.y1; y <= cube.y2; y++) {
			if (fillMapY[y] === false) {
				continue;
			}

			const line1 = mat[y];
			const fillMapX = fillMapYX[y];

			for (let x = cube.x1; x <= cube.x2; x++) {
				if (fillMapX[x] === false) {
					continue;
				}

				const line2 = line1[x];

				for (let z = cube.z1; z <= cube.z2; z++) {
					if (line2[z] !== null) {
						const cell = line2[z];

						if (this.checkFreeCellsAtTheTop(y, x, z)) {
							// direct light from the top
							cell.lightness = 1;
							break;
						}

						let rightLight = 1;
						let topLight = 1;

						for (let l = 1; l <= 4; l++) {
							if (!this.checkFreeCellsAtTheRight(y, x, z - l)) {
								rightLight -= 0.25;
							}

							if (!this.checkFreeCellsAtTheTop(y, x, z - l)) {
								topLight -= 0.25;
							}
						}

						cell.lightness = 0.9 * ((rightLight + topLight) / 2);

						break;
					}
				}
			}
		}
	}

	private checkFreeCellsAtTheTop(y: number, x: number, z: number): boolean {
		if (z < 0 || y < 0 || x < 0) {
			return true;
		}

		const mat = this.matrix.matrix;
		for (let y2 = y - 1, toY = Math.max(0, y - SNOW_LIGHT_MAX_TRACE_PATH_Y); y2 >= toY; y2--) {
			if (mat[y2][x][z] !== null) {
				return false;
			}
		}

		return true;
	}

	private checkFreeCellsAtTheRight(y: number, x: number, z: number): boolean {
		if (z < 0 || y < 0 || x < 0) {
			return true;
		}

		const mat = this.matrix.matrix;
		for (let x2 = x + 1, toX = Math.min(MATRIX_COLS - 1, x + SNOW_LIGHT_MAX_TRACE_PATH_X); x2 <= toX; x2++) {
			if (mat[y][x2][z] !== null) {
				return false;
			}
		}

		return true;
	}
}