import {SnowMatrix} from "game/snow/snow-matrix";
import {SnowCell} from "game/snow/snow-cell";

export class SnowGround {
	fill(matrix: SnowMatrix): void {
		const mat = matrix.matrix;
		for (let x = 0; x < matrix.cols; x++) {
			for (let z = 0; z < matrix.levels; z++) {
				const height = 5 * Math.sin(x / matrix.cols * Math.PI);
				const y0 = Math.round((matrix.rows - 1) - height);
				for (let y = y0; y < matrix.rows; y++) {
					mat[y][x][z] = new SnowCell();
				}
			}
		}
	}
}