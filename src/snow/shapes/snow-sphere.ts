import {SnowMatrix} from "game/snow/snow-matrix";
import {SnowCircle} from "game/snow/shapes/snow-circle";
import {SnowMatrixTransform} from "game/snow/snow-matrix-transform";

export class SnowSphere {
	private reduceCellsFactor = 0;

	setReduceCellsFactor(factor: number): SnowSphere {
		this.reduceCellsFactor = Math.max(0, Math.min(0.7, factor));
		return this;
	}

	generate(radius: number): SnowMatrix {
		const d = (radius << 1) + 1;
		const mat = new SnowMatrix(d, d, d);
		const transform = new SnowMatrixTransform(mat);

		for (let z = 0; z < d; z++) {
			const angle = Math.PI * (z / (d - 1));
			const r = Math.round(radius * Math.sin(angle));
			if (r <= 0) {
				continue;
			}


			const circleMat = new SnowCircle().generateZAxis(r);
			transform.merge(
				circleMat,
				radius - (circleMat.cols >> 1),
				radius - (circleMat.rows >> 1),
				z
			);
		}

		this.reduceCells(mat);

		return mat;
	}

	private reduceCells(mat: SnowMatrix): void {
		if (this.reduceCellsFactor === 0) {
			return;
		}
		
		for (let y = 0; y < mat.rows; y++) {
			const lineX = mat.matrix[y];

			for (let x = 0; x < mat.cols; x++) {
				const lineZ = lineX[x];

				for (let z = 0; z < mat.levels; z++) {
					if (lineZ[z] !== null && Math.random() < this.reduceCellsFactor) {
						lineZ[z] = null;
					}
				}
			}
		}
	}
}