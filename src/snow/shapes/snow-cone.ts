import {SnowMatrix} from "game/snow/snow-matrix";
import {SnowMatrixTransform} from "game/snow/snow-matrix-transform";
import {SnowCircle} from "game/snow/shapes/snow-circle";

export class SnowCone {
	generate(radius: number, length: number): SnowMatrix {
		const d = (radius << 1) + 1;
		const mat = new SnowMatrix(d, length, d);
		const transform = new SnowMatrixTransform(mat);
		const center = radius;

		for (let y = 1; y < length; y++) {
			const r = Math.round(radius * (y / (length - 1)));
			transform.merge(
				new SnowCircle().generateYAxis(r),
				center - r, y, center - r
			);
		}

		return mat;
	}
}