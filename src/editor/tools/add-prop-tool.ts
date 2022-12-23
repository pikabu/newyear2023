import {PointerHandler} from "game/editor/pointer-service";
import {SnowMatrix} from "game/snow/snow-matrix";
import {SnowCursor} from "game/snow/snow-cursor";
import {IMG_PROPS_SCALE, SCALE} from "game/config";
import {SnowProps} from "game/snow/snow-props";
import {SnowMatrixHistory} from "game/snow/snow-matrix-history";
import {SnowCell} from "game/snow/snow-cell";

export class AddPropTool implements PointerHandler {
	private img: HTMLImageElement | null = null;
	private code = 0;
	private observer: () => void | null = null;

	constructor(
		private readonly matrix: SnowMatrix,
		private readonly matrixHistory: SnowMatrixHistory,
		private readonly cursor: SnowCursor,
		private readonly props: SnowProps
	) {

	}

	setPropCode(code: number): void {
		this.code = code;
		this.img = this.props.getPropByCode(code);
	}

	observe(func: () => void | null): void {
		this.observer = func;
	}

	click(x: number, y: number): void {
		x = this.correctPosition(x);
		y = this.correctPosition(y);
		const {x: newX, y: newY} = this.matrix.getMatrixXYByClientXY(x, y);

		const colsHalf = Math.ceil(this.img.naturalWidth / IMG_PROPS_SCALE / this.matrix.cellSize / 2);
		const rowsHalf = Math.ceil(this.img.naturalHeight / IMG_PROPS_SCALE / this.matrix.cellSize / 2);

		const line = this.matrix.matrix[newY][newX];
		for (let z = 0; z < this.matrix.levels; z++) {
			if (line[z] !== null) {
				line[z].prop = this.code;
				SnowCell.updateCellHash(line[z]);
				this.matrix.mergeChangedCube({
					x1: newX - colsHalf,
					x2: newX + colsHalf,
					y1: newY - rowsHalf,
					y2: newY + colsHalf,
					z1: z,
					z2: z,
				});
				this.observer?.();
				break;
			}
		}
	}

	move(x: number, y: number): void {
		x = this.correctPosition(x);
		y = this.correctPosition(y);
		this.cursor.drawImage(x, y, this.img);
	}
	
	leave(): void {
		this.cursor.clear();
	}

	private correctPosition(v: number): number {
		v = v * SCALE;
		const step = this.matrix.cellSize;
		return Math.round(v / step) * step;
	}
}