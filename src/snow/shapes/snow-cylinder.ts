import {SnowMatrix} from "game/snow/snow-matrix";
import {SnowMatrixTransform} from "game/snow/snow-matrix-transform";
import {SnowCircle} from "game/snow/shapes/snow-circle";

export class SnowCylinder {
	generateVertical(radius: number, length: number): SnowMatrix {
		const d = (radius << 1) + 1;
		const mat = new SnowMatrix(d, length, d);
		const transform = new SnowMatrixTransform(mat);

		for (let y = 0; y < length; y++) {
			transform.merge(
				new SnowCircle().generateYAxis(radius),
				0, y, 0
			);
		}

		return mat;
	}

	generateHorizontal(radius: number, length: number): SnowMatrix {
		const d = (radius << 1) + 1;
		const mat = new SnowMatrix(d, d, length);
		const transform = new SnowMatrixTransform(mat);

		for (let z = 0; z < length; z++) {
			transform.merge(
				new SnowCircle().generateZAxis(radius),
				0, 0, z
			);
		}

		return mat;
	}
}