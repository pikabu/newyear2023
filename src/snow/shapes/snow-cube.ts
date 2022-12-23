import {SnowMatrix} from "game/snow/snow-matrix";
import {SnowCell} from "game/snow/snow-cell";

export class SnowCube {
	generate(size: number): SnowMatrix {
		const mat = new SnowMatrix(size, size, size);

		for (let y = 0; y < mat.rows; y++) {
			const lineX = mat.matrix[y];

			for (let x = 0; x < mat.cols; x++) {
				const lineZ = lineX[x];

				for (let z = 0; z < mat.levels; z++) {
					lineZ[z] = new SnowCell();
				}
			}
		}

		return mat;
	}
}