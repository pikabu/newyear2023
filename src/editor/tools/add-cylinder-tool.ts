import {PointerHandler} from "game/editor/pointer-service";
import {SnowMatrix} from "game/snow/snow-matrix";
import {CURSOR_ADD_COLOR, MATRIX_LEVELS, SCALE} from "game/config";
import {SnowCursor} from "game/snow/snow-cursor";
import {SnowMatrixTransform} from "game/snow/snow-matrix-transform";
import {SnowCylinder} from "game/snow/shapes/snow-cylinder";

export class AddCylinderTool implements PointerHandler {
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
		this.addCylinder(newX, newY);
	}

	move(x: number, y: number): void {
		x = this.correctPosition(x);
		y = this.correctPosition(y);

		const size = this.size * this.matrix.cellSize;
		const sizeHalf = size / 2;
		this.cursor.drawRect(x - size, y - sizeHalf, size * 2, size, CURSOR_ADD_COLOR);
	}

	leave(): void {
		this.cursor.clear();
	}

	private correctPosition(v: number): number {
		v = v * SCALE;
		const step = this.matrix.cellSize * 2;
		return Math.round(v / step) * step;
	}

	private addCylinder(x: number, y: number): void {
		const cylinder = new SnowCylinder().generateVertical(this.size - 1, this.size);

		const sizeHalf = this.size / 2;

		this.matrixTransform.merge(
			cylinder,
			Math.round((x - this.size) / 2) * 2,
			Math.round((y - sizeHalf) / 2) * 2,
			Math.round(((MATRIX_LEVELS >> 1) - this.size) / 2) * 2
		);

		if (this.observer !== null) {
			this.observer();
		}
	}
}