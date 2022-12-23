import {PointerHandler} from "game/editor/pointer-service";
import {SnowMatrix} from "game/snow/snow-matrix";
import {CURSOR_CHANGE_COLOR, PAINT_COLOR_ALPHA, SCALE, SNOW_SPHERE_MAX_RADIUS} from "game/config";
import {SnowCursor} from "game/snow/snow-cursor";
import {mixColors} from "game/helpers/color";
import {SnowMatrixHistory} from "game/snow/snow-matrix-history";
import {SnowCell} from "game/snow/snow-cell";

export class PaintTool implements PointerHandler {
	size: number = 20;
	private colorLight: number[] | null = null;
	private colorDark: number[] | null = null;
	private observer: () => void | null = null;

	constructor(
		private readonly matrix: SnowMatrix,
		private readonly matrixHistory: SnowMatrixHistory,
		private readonly cursor: SnowCursor
	) {

	}

	setColor(colorLight: number[], colorDark: number[]): void {
		this.colorLight = colorLight;
		this.colorDark = colorDark;
	}

	observe(func: () => void | null): void {
		this.observer = func;
	}

	click(x: number, y: number): void {
		x = this.correctPosition(x);
		y = this.correctPosition(y);
		const {x: newX, y: newY} = this.matrix.getMatrixXYByClientXY(x, y);
		this.paintCircle(newX, newY);
	}

	move(x: number, y: number): void {
		x = this.correctPosition(x);
		y = this.correctPosition(y);
		this.cursor.drawCircle(x, y, this.size * this.matrix.cellSize, CURSOR_CHANGE_COLOR);
	}

	leave(): void {
		this.cursor.clear();
	}

	private paintCircle(centerX: number, centerY: number): void {
		if (this.colorLight === null || this.colorDark === null) {
			return;
		}

		const size = Math.min(SNOW_SPHERE_MAX_RADIUS, this.size);
		const minY = Math.max(0, centerY - size);
		const maxY = Math.min(this.matrix.rows - 1, centerY + size);
		const minX = Math.max(0, centerX - size);
		const maxX = Math.min(this.matrix.cols - 1, centerX + size);
		let minZ = this.matrix.levels - 1;
		let maxZ = 0;
		const mat = this.matrix.matrix;

		for (let y = minY; y <= maxY; y++) {
			for (let x = minX; x <= maxX; x++) {
				const z = this.matrix.getZForNearestItem(x, y);
				if (z === null) {
					continue;
				}

				const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
				if (dist > size) {
					continue;
				}

				minZ = z < minZ ? z : minZ;
				maxZ = z > maxZ ? z : maxZ;

				const alpha = (PAINT_COLOR_ALPHA * (1 - dist / size)) | 0;

				const cell = mat[y][x][z];
				SnowCell.updateCellHash(cell);

				const lightColor = PaintTool.copyColorWithNewAlpha(this.colorLight, alpha);
				const colorDark = PaintTool.copyColorWithNewAlpha(this.colorDark, alpha);

				if (cell.colorDark !== null) {
					cell.colorLight = mixColors(lightColor, cell.colorLight);
					cell.colorDark = mixColors(colorDark, cell.colorDark);
				} else {
					cell.colorLight = lightColor;
					cell.colorDark = colorDark;
				}
			}
		}

		this.matrix.mergeChangedCube({
			x1: minX,
			x2: maxX,
			y1: minY,
			y2: maxY,
			z1: minZ,
			z2: maxZ,
		});

		if (this.observer !== null) {
			this.observer();
		}
	}

	private correctPosition(v: number): number {
		v = v * SCALE;
		const step = this.matrix.cellSize * 2;
		return Math.round(v / step) * step;
	}

	private static copyColorWithNewAlpha(color: number[], alpha: number): number[] {
		return [color[0], color[1], color[2], alpha];
	}
}