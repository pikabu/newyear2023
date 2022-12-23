import {PointerHandler} from "game/editor/pointer-service";
import {SnowMatrix} from "game/snow/snow-matrix";
import {CURSOR_ADD_COLOR, MATRIX_LEVELS, SCALE} from "game/config";
import {SnowCursor} from "game/snow/snow-cursor";
import {SnowMatrixTransform} from "game/snow/snow-matrix-transform";
import {SnowCone} from "game/snow/shapes/snow-cone";

export class AddConeTool implements PointerHandler {
	size: number = 20;
	private observer: () => void | null = null;

	constructor(
		private readonly matrix: SnowMatrix,
		private readonly matrixTransform: SnowMatrixTransform,
		private readonly cursor: SnowCursor
	) {

	}

	observe(func: () => void | null): void {
		this.observer = func;
	}

	click(x: number, y: number): void {
		x = this.correctPosition(x);
		y = this.correctPosition(y);
		const {x: newX, y: newY} = this.matrix.getMatrixXYByClientXY(x, y);
		this.addCone(newX, newY);
	}

	move(x: number, y: number): void {
		x = this.correctPosition(x);
		y = this.correctPosition(y);
		const size = this.size * this.matrix.cellSize;
		const size2 = size << 1;
		this.cursor.drawTriangle(x - size, y - size, size2, size2, CURSOR_ADD_COLOR);
	}

	leave(): void {
		this.cursor.clear();
	}

	private correctPosition(v: number): number {
		v = v * SCALE;
		const step = this.matrix.cellSize * 2;
		return Math.round(v / step) * step;
	}

	private addCone(x: number, y: number): void {
		this.matrixTransform.merge(
			new SnowCone().generate(this.size, this.size * 2),
			x - this.size,
			y - this.size,
			(MATRIX_LEVELS >> 1) - this.size
		);

		if (this.observer !== null) {
			this.observer();
		}
	}
}