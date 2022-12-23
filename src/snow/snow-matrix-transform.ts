import {SnowMatrix} from "game/snow/snow-matrix";
import {SnowMatrixHistory} from "game/snow/snow-matrix-history";
import {SnowCell} from "game/snow/snow-cell";
import {SnowProps} from "game/snow/snow-props";

export class SnowMatrixTransform {
	constructor(
		private readonly matrix: SnowMatrix,
		private readonly history: SnowMatrixHistory = null,
		private readonly props: SnowProps = null
	) {

	}

	setCell(y: number, x: number, z: number, cell: SnowCell | null): void {
		this.matrix.matrix[y][x][z] = cell;
		this.updateChangedCube(x, y, z, cell);
	}

	excludeNearest(mat: SnowMatrix, x: number, y: number): void {
		let removedLevels = 0;
		for (let z = 0; z < this.matrix.levels && removedLevels < 2; z++) {
			if (this.exclude(mat, x, y, z) > 0) {
				removedLevels++;
			}
		}
		this.matrix.resetCache();
	}

	exclude(mat: SnowMatrix, x: number, y: number, z: number): number {
		const matDst = this.matrix.matrix;
		const matSrc = mat.matrix;

		const fromX = x - (mat.cols >> 1);
		const fromY = y - (mat.rows >> 1);
		const fromZ = z - (mat.levels >> 1);

		const toX = fromX + mat.cols;
		const toY = fromY + mat.rows;
		const toZ = fromZ + mat.levels;

		let deleted = 0;

		for (let y2 = fromY; y2 < toY; y2++) {
			if (y2 >= this.matrix.rows || y2 < 0) {
				continue;
			}

			for (let x2 = fromX; x2 < toX; x2++) {
				if (x2 >= this.matrix.cols || x2 < 0) {
					continue;
				}

				for (let z2 = fromZ; z2 < toZ; z2++) {
					if (z2 >= this.matrix.levels || z2 < 0) {
						continue;
					}

					if (matSrc[y2 - fromY][x2 - fromX][z2 - fromZ] !== null && matDst[y2][x2][z2] !== null) {
						this.updateChangedCube(x2, y2, z2, matDst[y2][x2][z2]);
						matDst[y2][x2][z2] = null;
						deleted++;
					}
				}
			}
		}

		return deleted;
	}

	merge(mat: SnowMatrix, x: number, y: number, z:number): void {
		const matDst = this.matrix.matrix;
		const matSrc = mat.matrix;

		for (let y2 = 0; y2 < mat.rows; y2++) {
			const dy = y2 + y;
			if (dy >= this.matrix.rows || dy < 0) {
				continue;
			}

			for (let x2 = 0; x2 < mat.cols; x2++) {
				const dx = x2 + x;
				if (dx >= this.matrix.cols || dx < 0) {
					continue;
				}

				for (let z2 = 0; z2 < mat.levels; z2++) {
					const dz = z2 + z;
					if (dz >= this.matrix.levels || dz < 0) {
						continue;
					}

					if (matSrc[y2][x2][z2] !== null) {
						matDst[dy][dx][dz] = matSrc[y2][x2][z2];
						this.updateChangedCube(dx, dy, dz);
					}
				}
			}
		}

		this.matrix.resetCache();
	}

	private updateChangedCube(x: number, y: number, z: number, cell: SnowCell | null = null): void {
		const cube = this.matrix.changedCube;
		
		if (y < cube.y1) {
			cube.y1 = y;
		}

		if (y > cube.y2) {
			cube.y2 = y;
		}

		if (x < cube.x1) {
			cube.x1 = x;
		}

		if (x > cube.x2) {
			cube.x2 = x;
		}

		if (z < cube.z1) {
			cube.z1 = z;
		}

		if (z > cube.z2) {
			cube.z2 = z;
		}

		if (cell !== null && cell.prop > 0) {
			const img = this.props.getPropByCode(cell.prop);
			if (img) {
				const w = img.naturalWidth >> 1;
				const h = img.naturalHeight >> 1;
				const x1 = x - Math.floor(w / this.matrix.cellSize);
				const x2 = x1 + Math.ceil(w / this.matrix.cellSize);
				const y1 = y - Math.floor(h / this.matrix.cellSize);
				const y2 = y1 + Math.ceil(h / this.matrix.cellSize);
				this.updateChangedCube(x1, y1, z);
				this.updateChangedCube(x2, y2, z);
			}
		}
	}
}