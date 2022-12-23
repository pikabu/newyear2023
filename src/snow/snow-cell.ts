import {MATRIX_BALL_MAX_RADIUS, MATRIX_BALL_MIN_RADIUS, SNOW_MAX_DARKNESS} from "game/config";
import {SnowGroundingCalc} from "game/snow/physics/snow-grounding-calc";

export class SnowCell {
	hash = '';
	extraRadius = 0;
	lightness = 1;
	darkness = 0;
	isDropShadow = false;
	prop = 0;
	groundingVersion: number;
	colorLight: number[] | null = null;
	colorDark: number[] | null = null;

	constructor() {
		this.extraRadius = Math.random() * (MATRIX_BALL_MAX_RADIUS - MATRIX_BALL_MIN_RADIUS);
		this.darkness = Math.random() * SNOW_MAX_DARKNESS;
		this.groundingVersion = SnowGroundingCalc.version;
		SnowCell.updateCellHash(this);
	}

	static updateCellHash(cell: SnowCell): void {
		cell.hash = [
			(cell.extraRadius * 1000) | 0,
			(cell.darkness * 100) | 0,
			cell.prop,
			...(cell.colorLight || [0, 0, 0, 0]),
			...(cell.colorDark || [0, 0, 0, 0]),
		].join(',');
	}
}