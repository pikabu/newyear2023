import {SnowCell} from "game/snow/snow-cell";
import {SnowMatrix} from "game/snow/snow-matrix";

export class SnowCircle {
	generateZAxis(radius: number): SnowMatrix {
		const d = (radius << 1) + 1;
		const mat = new SnowMatrix(d, d, 1);
		const center = radius;

		let lastX = null, lastY = null;
		for (let a = 90; a < 270; a++) {
			const angle = a * Math.PI / 180;
			let x = Math.round(Math.cos(angle) * radius);
			let y = Math.round(Math.sin(angle) * -radius);
			if (x === lastX && y === lastY) {
				continue;
			}

			lastX = x;
			lastY = y;

			for (let x2 = x, toX = Math.abs(x); x2 < toX; x2++) {
				mat.matrix[center + y][center + x2][0] = new SnowCell();
			}
		}

		return mat;
	}

	generateYAxis(radius: number): SnowMatrix {
		const d = (radius << 1) + 1;
		const mat = new SnowMatrix(d, 1, d);
		const center = radius;

		let lastX = null, lastZ = null;
		for (let a = 90; a < 270; a++) {
			const angle = a * Math.PI / 180;
			let x = Math.round(Math.cos(angle) * radius);
			let z = Math.round(Math.sin(angle) * -radius);
			if (x === lastX && z === lastZ) {
				continue;
			}

			lastX = x;
			lastZ = z;

			for (let x2 = x, toX = Math.abs(x); x2 < toX; x2++) {
				mat.matrix[0][center + x2][center + z] = new SnowCell();
			}
		}

		return mat;
	}
}