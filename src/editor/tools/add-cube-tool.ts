import {PointerHandler} from "game/editor/pointer-service";
import {SnowMatrix} from "game/snow/snow-matrix";
import {CURSOR_ADD_COLOR, MATRIX_LEVELS, SCALE} from "game/config";
import {SnowCursor} from "game/snow/snow-cursor";
import {SnowCube} from "game/snow/shapes/snow-cube";
import {SnowMatrixTransform} from "game/snow/snow-matrix-transform";

export class AddCubeTool implements PointerHandler {
	size: number = 40;
	private observer: () => void | null = null;

	constructor(
		private readonly matrix: SnowMatrix,
		private readonly matrixTransform: SnowMatrixTransform,
		private readonly cursor: SnowCursor) {

	}

	observe(func: () => void | null): void {
		this.observer = func;
	}

	click(x: number, y: number): void {
		x = this.correctPosition(x);
		y = this.correctPosition(y);
		const {x: newX, y: newY} = this.matrix.getMatrixXYByClientXY(x, y);
		this.addCube(newX, newY);
	}

	move(x: number, y: number): void {
		x = this.correctPosition(x);
		y = this.correctPosition(y);
		const size = this.size * this.matrix.cellSize;
		const sizeHalf = size / 2;
		this.cursor.drawRect(x - sizeHalf, y - sizeHalf, size, size, CURSOR_ADD_COLOR);
	}

	leave(): void {
		this.cursor.clear();
	}

	private correctPosition(v: number): number {
		v = v * SCALE;
		const step = this.matrix.cellSize * 2;
		return Math.round(v / step) * step;
	}

	private addCube(x: number, y: number): void {
		const cube = new SnowCube().generate(this.size - 1);

		// make rounding (remove corners)
		AddCubeTool.roundCorners(cube);

		const sizeHalf = this.size / 2;

		this.matrixTransform.merge(
			cube,
			Math.round((x - sizeHalf) / 2) * 2,
			Math.round((y - sizeHalf) / 2) * 2,
			Math.round(((MATRIX_LEVELS >> 1) - sizeHalf) / 2) * 2
		);

		if (this.observer !== null) {
			this.observer();
		}
	}

	private static roundCorners(cube: SnowMatrix): void {
		const maxY = cube.rows - 1;
		const maxX = cube.cols - 1;
		const maxZ = cube.levels - 1;

		for (let y = 0; y < cube.rows; y++) {
			cube.matrix[y][0][0] = null;
			cube.matrix[y][0][maxZ] = null;
			cube.matrix[y][maxX][0] = null;
			cube.matrix[y][maxX][maxZ] = null;
		}

		for (let x = 0; x < cube.cols; x++) {
			cube.matrix[0][x][0] = null;
			cube.matrix[0][x][maxZ] = null;
			cube.matrix[maxY][x][0] = null;
			cube.matrix[maxY][x][maxZ] = null;
		}
	}
}