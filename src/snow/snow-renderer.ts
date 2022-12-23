import {
	IMG_PROPS_SCALE,
	MATRIX_BALL_MIN_RADIUS,
	MATRIX_LEVELS,
	RENDER_AREA_MATRIX_INDENT_CELLS,
	SCALE,
	SNOW_BLUR_SIZE,
	SNOW_DARK_COLOR,
	SNOW_DROP_SHADOW_DISTANCE_BY_RADIUS_FACTOR,
	SNOW_DROP_SHADOW_RADIUS_FACTOR,
	SNOW_LIGHT_COLOR,
	SNOW_SHADOW_DARK_COLOR,
	SNOW_SHADOW_LIGHT_COLOR
} from "game/config";
import {SnowRenderItem} from "game/snow/snow-render-item";
import {SnowMatrix} from "game/snow/snow-matrix";
import {RenderOptions} from "game/snow/render-options";
import {SnowCell} from "game/snow/snow-cell";
import {convertColorDecToHex, getInterpolatedColor, mixColors} from "game/helpers/color";
import {SnowProps} from "game/snow/snow-props";

const MATH_PI_2 = Math.PI * 2;

export class SnowRenderer {
	readonly canvas: HTMLCanvasElement;
	private readonly context: CanvasRenderingContext2D;

	private readonly tempCanvas: HTMLCanvasElement;
	private readonly tempContext: CanvasRenderingContext2D;

	private readonly blurCanvas: HTMLCanvasElement;
	private readonly blurContext: CanvasRenderingContext2D;

	constructor(
		private readonly matrix: SnowMatrix,
		private readonly options: RenderOptions,
		private readonly props: SnowProps,
		keepOriginalScale = false
	) {
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.matrix.cols * this.matrix.cellSize;
		this.canvas.height = this.matrix.rows * this.matrix.cellSize;

		if (!keepOriginalScale) {
			this.canvas.style.width = `${this.canvas.width / SCALE}px`;
			this.canvas.style.height = `${this.canvas.height / SCALE}px`;
		}

		this.context = this.canvas.getContext('2d');

		this.tempCanvas = document.createElement('canvas');
		this.tempCanvas.width = this.canvas.width;
		this.tempCanvas.height = this.canvas.height;
		this.tempContext = this.tempCanvas.getContext('2d');

		this.blurCanvas = document.createElement('canvas');
		this.blurCanvas.width = this.tempCanvas.width;
		this.blurCanvas.height = this.tempCanvas.height;
		this.blurContext = this.blurCanvas.getContext('2d');
	}

	renderItems(items: SnowRenderItem[]): void {
		console.log('Render items: ' + items.length);
		if (!this.matrix.hasChangedArea()) {
			return;
		}

		const mat = this.matrix;

		const cube = mat.changedCube;
		const renderFromX = Math.max(0, (cube.x1 - RENDER_AREA_MATRIX_INDENT_CELLS) * mat.cellSize);
		const renderFromY = Math.max(0, (cube.y1 - RENDER_AREA_MATRIX_INDENT_CELLS) * mat.cellSize);
		const renderWidth = Math.min(this.tempCanvas.width, (cube.x2 + RENDER_AREA_MATRIX_INDENT_CELLS) * mat.cellSize)
			- renderFromX;
		const renderHeight = Math.min(this.tempCanvas.height, (cube.y2 + RENDER_AREA_MATRIX_INDENT_CELLS) * mat.cellSize)
			- renderFromY;

		items = this.filterRenderList(items);

		const layers = SnowRenderer.splitOnLayers(items);
		this.tempContext.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);

		// save initial state
		this.tempContext.save();

		for (let l = MATRIX_LEVELS; l >= 0; l--) {
			const layer = layers[l];
			if (layer.length === 0) {
				continue;
			}

			//this.renderShadow(layer);
			this.renderCells(layer);
		}

		this.applyBlur(renderFromX, renderFromY, renderWidth, renderHeight);

		for (let l = MATRIX_LEVELS; l >= 0; l--) {
			const layer = layers[l];
			if (layer.length === 0) {
				continue;
			}

			this.renderProps(layer);
		}

		// restore initial state
		this.tempContext.restore();

		this.context.clearRect(renderFromX, renderFromY, renderWidth, renderHeight);
		this.context.drawImage(
			this.tempCanvas,
			renderFromX, renderFromY, renderWidth, renderHeight,
			renderFromX, renderFromY, renderWidth, renderHeight
		);

		if (this.options.showRenderAreas) {
			this.renderArea(renderFromX, renderFromY, renderWidth, renderHeight);
		}
	}

	private applyBlur(x: number, y: number, width: number, height: number): void {
		this.blurContext.clearRect(x, y, width, height);
		this.blurContext.drawImage(this.tempCanvas, x, y, width, height, x, y, width, height);

		this.tempContext.save();
		this.tempContext.filter = `blur(${SNOW_BLUR_SIZE}px)`;
		this.tempContext.globalCompositeOperation = 'source-atop';
		this.tempContext.drawImage(this.blurCanvas, x, y, width, height, x, y, width, height);
		this.tempContext.restore();
	}

	private renderShadow(layer: SnowRenderItem[]): void {
		const mat = this.matrix;

		this.tempContext.globalCompositeOperation = 'source-atop';
		for (let i = 0; i < layer.length; i++) {
			const item = layer[i];
			if (!item.cell.isDropShadow) {
				continue;
			}

			this.tempContext.save();
			this.tempContext.translate(
				item.x * mat.cellSize + mat.cellSizeHalf,
				item.y * mat.cellSize + mat.cellSizeHalf
			);

			this.renderCellShadow(item.cell);

			this.tempContext.restore();
		}
	}

	private renderCells(layer: SnowRenderItem[]): void {
		const mat = this.matrix;

		this.tempContext.globalCompositeOperation = 'source-over';
		for (let i = 0; i < layer.length; i++) {
			const item = layer[i];

			this.tempContext.save();
			this.tempContext.translate(
				item.x * mat.cellSize + mat.cellSizeHalf,
				item.y * mat.cellSize + mat.cellSizeHalf
			);

			this.renderCell(item.cell);

			this.tempContext.restore();
		}
	}

	private renderProps(layer: SnowRenderItem[]): void {
		const mat = this.matrix;

		this.tempContext.globalCompositeOperation = 'source-over';
		for (let i = 0; i < layer.length; i++) {
			const item = layer[i];
			if (!item.cell.prop) {
				continue;
			}

			this.tempContext.save();
			this.tempContext.translate(
				item.x * mat.cellSize + mat.cellSizeHalf,
				item.y * mat.cellSize + mat.cellSizeHalf
			);

			this.renderCellProps(item.cell);

			this.tempContext.restore();
		}
	}

	private renderArea(x: number, y: number, width: number, height: number): void {
		this.context.save();
		this.context.beginPath();
		this.context.strokeStyle = '#ff00ff';
		this.context.rect(x, y, width, height);
		this.context.closePath();
		this.context.stroke();
		this.context.restore();
	}

	private filterRenderList(items: SnowRenderItem[]): SnowRenderItem[] {
		const cube = this.matrix.changedCube;
		const shift = RENDER_AREA_MATRIX_INDENT_CELLS << 1;

		const minX = cube.x1 - shift;
		const maxX = cube.x2 + shift;
		const minY = cube.y1 - shift;
		const maxY = cube.y2 + shift;

		return items.filter(item => {
			if (item.cell.prop > 0) {
				const img = this.props.getPropByCode(item.cell.prop);
				if (img) {
					const w = img.naturalWidth >> 1;
					const h = img.naturalHeight >> 1;
					const x1 = item.x - Math.floor(w / this.matrix.cellSize);
					const x2 = x1 + Math.ceil(w / this.matrix.cellSize);
					const y1 = item.y - Math.floor(h / this.matrix.cellSize);
					const y2 = y1 + Math.ceil(h / this.matrix.cellSize);

					if (x1 <= maxX && x2 >= minX && y1 <= maxY && y2 >= minY) {
						return true;
					}
				}
			}

			return item.x >= minX && item.x <= maxX
				&& item.y >= minY && item.y <= maxY;
		});
	}

	private static splitOnLayers(items: SnowRenderItem[]): SnowRenderItem[][] {
		const layers = new Array(MATRIX_LEVELS + 1).fill(null).map(() => []);
		for (const item of items) {
			layers[item.z].push(item);
		}

		return layers;
	}

	private renderCell(cell: SnowCell): void {
		let color = getInterpolatedColor(cell.lightness - cell.darkness, SNOW_LIGHT_COLOR, SNOW_DARK_COLOR);

		if (cell.colorLight !== null && cell.colorDark !== null) {
			color = mixColors(
				getInterpolatedColor(cell.lightness - cell.darkness, cell.colorLight, cell.colorDark),
				color
			);
		}

		this.tempContext.fillStyle = convertColorDecToHex(color);
		this.tempContext.beginPath();
		this.tempContext.arc(0, 0, MATRIX_BALL_MIN_RADIUS + cell.extraRadius, 0, MATH_PI_2);
		this.tempContext.closePath();
		this.tempContext.fill();
	}

	private renderCellShadow(cell: SnowCell): void {
		if (!cell.isDropShadow) {
			return;
		}

		const radius = MATRIX_BALL_MIN_RADIUS + cell.extraRadius;
		const offset = radius * SNOW_DROP_SHADOW_DISTANCE_BY_RADIUS_FACTOR;

		let color = getInterpolatedColor(cell.lightness - cell.darkness, SNOW_SHADOW_LIGHT_COLOR, SNOW_SHADOW_DARK_COLOR);

		if (cell.colorLight !== null && cell.colorDark !== null) {
			color = mixColors(
				getInterpolatedColor(cell.lightness - cell.darkness, cell.colorLight, cell.colorDark),
				color
			);
		}

		this.tempContext.fillStyle = convertColorDecToHex(color);
		this.tempContext.beginPath();
		this.tempContext.arc(
			-offset,
			offset,
			radius * SNOW_DROP_SHADOW_RADIUS_FACTOR,
			0,
			MATH_PI_2
		);
		this.tempContext.closePath();
		this.tempContext.fill();
	}

	private renderCellProps(cell: SnowCell): void {
		if (!cell.prop) {
			return;
		}
		const img = this.props.getPropByCode(cell.prop);
		if (!img) {
			return;
		}

		const width = img.naturalWidth / IMG_PROPS_SCALE;
		const height = img.naturalHeight / IMG_PROPS_SCALE;

		this.tempContext.drawImage(
			img,
			-Math.floor(width / 2),
			-Math.floor(height / 2),
			width,
			height
		);
	}
}