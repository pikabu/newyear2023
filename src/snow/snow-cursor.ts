import {SnowRenderer} from "game/snow/snow-renderer";
import {SnowMatrix} from "game/snow/snow-matrix";
import {IMG_PROPS_SCALE, SCALE} from "game/config";

const MATH_PI2 = Math.PI * 2;

export class SnowCursor {
	readonly canvas: HTMLCanvasElement;
	private readonly context: CanvasRenderingContext2D;

	constructor(renderer: SnowRenderer, private readonly matrix: SnowMatrix) {
		this.canvas = document.createElement('canvas');
		this.canvas.width = renderer.canvas.width;
		this.canvas.height = renderer.canvas.height;
		this.canvas.style.width = `${this.canvas.width / SCALE}px`;
		this.canvas.style.height = `${this.canvas.height / SCALE}px`;
		this.context = this.canvas.getContext('2d');
	}

	clear(): void {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	drawCircle(x: number, y: number, radius: number, color: string): void {
		x = this.correctPosition(x);
		y = this.correctPosition(y);
		this.clear();
		this.context.save();
		this.context.strokeStyle = color;
		this.context.lineWidth = 2;
		this.context.beginPath();
		this.context.arc(x, y, radius, MATH_PI2, 0);
		this.context.closePath();
		this.context.stroke();
		this.context.restore();
	}

	drawTriangle(x: number, y: number, width: number, height: number, color: string): void {
		x = this.correctPosition(x);
		y = this.correctPosition(y);
		this.clear();
		this.context.save();
		this.context.strokeStyle = color;
		this.context.lineWidth = 2;
		this.context.beginPath();
		this.context.moveTo(x + (width >> 1), y);
		this.context.lineTo(x + width, y + height);
		this.context.lineTo(x, y + height);
		this.context.closePath();
		this.context.stroke();
		this.context.restore();
	}

	drawRect(x: number, y: number, width: number, height: number, color: string): void {
		x = this.correctPosition(x);
		y = this.correctPosition(y);
		this.clear();
		this.context.save();
		this.context.strokeStyle = color;
		this.context.lineWidth = 2;
		this.context.beginPath();
		this.context.rect(x, y, width, height);
		this.context.closePath();
		this.context.stroke();
		this.context.restore();
	}

	drawImage(x: number, y: number, img: HTMLImageElement): void {
		x = this.correctPosition(x);
		y = this.correctPosition(y);
		const width2 = img.naturalWidth / IMG_PROPS_SCALE;
		const height2 = img.naturalHeight / IMG_PROPS_SCALE;
		this.clear();
		this.context.drawImage(img, x - Math.floor(width2 / 2), y - Math.floor(height2 / 2), width2, height2);
	}

	private correctPosition(v: number): number {
		return Math.round(v / this.matrix.cellSize) * this.matrix.cellSize;
	}
}