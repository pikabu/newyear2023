import {SnowMatrix} from "game/snow/snow-matrix";
import {MATRIX_COLS, MATRIX_LEVELS, MATRIX_ROWS} from "game/config";
import {SnowCell} from "game/snow/snow-cell";
import {SnowProps} from "game/snow/snow-props";
import {RenderOptions} from "game/snow/render-options";
import {SnowMatrixHistory} from "game/snow/snow-matrix-history";
import {SnowRenderer} from "game/snow/snow-renderer";
import {SnowScene} from "game/snow/snow-scene";
import "game/viewer/viewer.scss";

const BYTES_PER_CELL = 14;

export class Viewer {
	readonly el: HTMLElement;
	private readonly matrix: SnowMatrix;
	private readonly scene: SnowScene;
	private readonly props: SnowProps;

	constructor() {
		this.props = new SnowProps();
		this.matrix = new SnowMatrix(MATRIX_COLS, MATRIX_ROWS, MATRIX_LEVELS);
		const matrixHistory = new SnowMatrixHistory(this.matrix);
		const renderOptions = new RenderOptions();
		const renderer = new SnowRenderer(this.matrix, renderOptions, this.props, true);
		this.scene = new SnowScene(this.matrix, matrixHistory, renderer);

		this.el = renderer.canvas;
	}

	async load(data: string): Promise<void> {
		await this.parseData(data);
		this.matrix.setInitialChangedCube();
		this.matrix.resetCache();
		this.scene.requestRender();
	}

	private parseData(data: string): Promise<any> {
		const chars = Uint8Array.from(window.atob(data), c => c.charCodeAt(0));
		const propCodes = new Set<number>();
		const loadList: Promise<HTMLImageElement>[] = [];

		for (let i = 0; i < chars.length; i += BYTES_PER_CELL) {
			const y = chars[i];
			const x = chars[i + 1];
			const z = chars[i + 2];
			const cell = this.matrix.matrix[y][x][z] = new SnowCell();
			cell.extraRadius = chars[i + 3] / 10;
			cell.darkness = chars[i + 4] / 255;

			if (chars[i + 8] !== 0) {
				cell.colorLight = [
					chars[i + 5],
					chars[i + 6],
					chars[i + 7],
					chars[i + 8],
				];
			}

			if (chars[i + 12] !== 0) {
				cell.colorDark = [
					chars[i + 9],
					chars[i + 10],
					chars[i + 11],
					chars[i + 12],
				];
			}

			cell.prop = chars[i + 13];
			if (cell.prop > 0 && !propCodes.has(cell.prop)) {
				propCodes.add(cell.prop);
				loadList.push(this.props.setProp(cell.prop, `assets/prop${cell.prop}.png`));
			}
		}

		if (loadList.length === 0) {
			return Promise.resolve();
		}

		return Promise.all(loadList);
	}
}