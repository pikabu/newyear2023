import {SnowCell} from "game/snow/snow-cell";
import {SnowRenderItem} from "game/snow/snow-render-item";
import {MATRIX_CELL_SIZE, RENDER_AREA_MATRIX_INDENT_CELLS} from "game/config";

type Cube = {
	x1: number,
	y1: number,
	z1: number,

	x2: number,
	y2: number,
	z2: number,
};

export class SnowMatrix {
	matrix: (SnowCell | null)[][][];
	readonly changedCube: Cube;
	readonly cellSize: number;
	readonly cellSizeHalf: number;

	private fillMapYX: boolean[][] | null = null;
	private fillMapY: boolean[] | null = null;
	private renderList: SnowRenderItem[] | null = null;

	constructor(readonly cols: number, readonly rows: number, readonly levels: number) {
		this.changedCube = {x1: 0, x2: 0, y1: 0, y2: 0, z1: 0, z2: 0};
		this.cellSize = MATRIX_CELL_SIZE;
		this.cellSizeHalf = MATRIX_CELL_SIZE >> 1;
		this.matrix = this.getEmptyMatrix();
		this.setInitialChangedCube();
	}

	getElementsCount(): number {
		let cnt = 0;
		for (let y = 0; y < this.matrix.length; y++) {
			const line1 = this.matrix[y];

			for (let x = 0; x < line1.length; x++) {
				const line2 = line1[x];

				for (let z = 0; z < line2.length; z++) {
					if (line2[z] !== null) {
						cnt++;
					}
				}
			}
		}

		return cnt;
	}

	getZForNearestItem(x: number, y: number): number | null {
		if (y < 0 || x < 0 || y >= this.rows || x >= this.cols) {
			return null;
		}

		for (let z = 0; z < this.levels; z++) {
			if (this.matrix[y][x][z] !== null) {
				return z;
			}
		}

		return null;
	}

	getMatrixXYByClientXY(clientX: number, clientY: number): {x: number, y: number} {
		return {
			x: Math.floor(clientX / this.cellSize),
			y: Math.floor(clientY / this.cellSize),
		};
	}

	getFillMapYX(): boolean[][] {
		if (this.fillMapYX === null) {
			this.calcFillMap();
		}

		return this.fillMapYX;
	}

	getFillMapY(): boolean[] {
		if (this.fillMapY === null) {
			this.calcFillMap();
		}

		return this.fillMapY;
	}

	resetCache(): void {
		this.renderList = null;
		this.fillMapY = null;
		this.fillMapYX = null;
	}

	setInitialChangedCube(): void {
		this.changedCube.x1 = 0;
		this.changedCube.x2 = this.cols - 1;
		this.changedCube.y1 = 0;
		this.changedCube.y2 = this.rows - 1;
		this.changedCube.z1 = 0;
		this.changedCube.z2 = this.levels - 1;
	}

	mergeChangedCube(newCube: Cube): void {
		this.changedCube.x1 = Math.min(this.changedCube.x1, newCube.x1);
		this.changedCube.x2 = Math.max(this.changedCube.x2, newCube.x2);

		this.changedCube.y1 = Math.min(this.changedCube.y1, newCube.y1);
		this.changedCube.y2 = Math.max(this.changedCube.y2, newCube.y2);

		this.changedCube.z1 = Math.min(this.changedCube.z1, newCube.z1);
		this.changedCube.z2 = Math.max(this.changedCube.z2, newCube.z2);
	}

	getChangedCubeWithRenderIndent(): Cube {
		return {
			x1: Math.max(0, this.changedCube.x1 - RENDER_AREA_MATRIX_INDENT_CELLS),
			x2: Math.min(this.cols - 1, this.changedCube.x2 + RENDER_AREA_MATRIX_INDENT_CELLS),

			y1: Math.max(0, this.changedCube.y1 - RENDER_AREA_MATRIX_INDENT_CELLS),
			y2: Math.min(this.rows - 1, this.changedCube.y2 + RENDER_AREA_MATRIX_INDENT_CELLS),

			z1: Math.max(0, this.changedCube.z1 - RENDER_AREA_MATRIX_INDENT_CELLS),
			z2: Math.min(this.levels - 1, this.changedCube.z2 + RENDER_AREA_MATRIX_INDENT_CELLS),
		};
	}

	hasChangedArea(): boolean {
		return this.changedCube.x1 !== this.cols
			|| this.changedCube.y1 !== this.rows
			|| this.changedCube.z1 !== this.levels
			|| this.changedCube.x2 !== 0
			|| this.changedCube.y2 !== 0
			|| this.changedCube.z2 !== 0;
	}

	resetChangedArea(): void {
		this.changedCube.x1 = this.cols;
		this.changedCube.y1 = this.rows;
		this.changedCube.z1 = this.levels;
		this.changedCube.x2 = 0;
		this.changedCube.y2 = 0;
		this.changedCube.z2 = 0;
	}

	getRenderList(): SnowRenderItem[] {
		if (this.renderList !== null) {
			return this.renderList;
		}

		const fillMapY = this.getFillMapY();
		const fillMapYX = this.getFillMapYX();

		this.renderList = [];

		for (let y = 0; y < this.rows; y++) {
			if (fillMapY[y] === false) {
				continue;
			}

			const fillMapX = fillMapYX[y];

			for (let x = 0; x < this.cols; x++) {
				if (fillMapX[x] === false) {
					continue;
				}

				const line = this.matrix[y][x];

				for (let z = 0; z < this.levels; z++) {
					if (line[z] !== null) {
						this.renderList.push(new SnowRenderItem(line[z], x, y, z));
						break;
					}
				}
			}
		}

		return this.renderList;
	}

	clear(): void {
		this.matrix = this.getEmptyMatrix();
		this.resetCache();
		this.setInitialChangedCube();
	}

	private calcFillMap(): void {
		this.fillMapYX = new Array(this.rows)
			.fill(null)
			.map(() => new Array(this.cols).fill(false));

		this.fillMapY = new Array(this.rows).fill(false);

		for (let y = 0; y < this.matrix.length; y++) {
			const line1 = this.matrix[y];

			for (let x = 0; x < line1.length; x++) {
				const line2 = line1[x];

				for (let z = 0; z < line2.length; z++) {
					if (line2[z] !== null) {
						this.fillMapYX[y][x] = true;
						this.fillMapY[y] = true;
						break;
					}
				}
			}
		}
	}

	private getEmptyMatrix(): (SnowCell | null)[][][] {
		return new Array(this.rows)
			.fill(null)
			.map(() => new Array(this.cols)
				.fill(null)
				.map(() => new Array(this.levels).fill(null))
			);
	}
}