import {PointerHandler} from "game/editor/pointer-service";
import {SnowMatrix} from "game/snow/snow-matrix";
import {SnowSphere} from "game/snow/shapes/snow-sphere";
import {SnowCursor} from "game/snow/snow-cursor";
import {CURSOR_DEL_COLOR, SCALE} from "game/config";
import {SnowMatrixTransform} from "game/snow/snow-matrix-transform";

export class EraseBallTool implements PointerHandler {
	size: number = 7;
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
		this.excludeSphere(newX, newY);
	}

	move(x: number, y: number): void {
		x = this.correctPosition(x);
		y = this.correctPosition(y);
		this.cursor.drawCircle(x, y, this.size * this.matrix.cellSize, CURSOR_DEL_COLOR);
	}

	leave(): void {
		this.cursor.clear();
	}

	private correctPosition(v: number): number {
		v = v * SCALE;
		const step = this.matrix.cellSize * 2;
		return Math.round(v / step) * step;
	}

	private excludeSphere(x: number, y: number): void {
		this.matrixTransform.excludeNearest(new SnowSphere().generate(this.size), x, y);

		if (this.observer !== null) {
			this.observer();
		}
	}
}