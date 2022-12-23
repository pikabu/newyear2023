import {SnowMatrix} from "game/snow/snow-matrix";

export class SnowDropShadowCalc {
	constructor(private readonly matrix: SnowMatrix) {

	}

	calc(): void {
		const mat = this.matrix.matrix;
		const fillMapYX = this.matrix.getFillMapYX();
		const fillMapY = this.matrix.getFillMapY();
		const lastY = mat.length - 1;

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

						// drop shadow if at least one neighbor cell in the same Z is missing
						cell.isDropShadow = (x !== 0 && !mat[y][x - 1][z]) // missing left cell
							|| (x !== 0 && y !== lastY && !mat[y + 1][x - 1][z]) // missing bottom-left cell
							|| (y !== lastY && !mat[y + 1][x][z]) // missing bottom cell;
						break;
					}
				}
			}
		}
	}
}