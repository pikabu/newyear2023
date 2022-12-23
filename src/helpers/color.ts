export function getInterpolatedColor(value: number, colorLight: number[], colorDark: number[]): number[] {
	let color;
	value = value > 1 ? 1 : (value < 0 ? 0 : value);

	if (value === 0) {
		color = colorDark;
	} else if (value === 1) {
		color = colorLight;
	} else {
		color = [
			Math.max(0, Math.min(255, colorDark[0] + (colorLight[0] - colorDark[0]) * value)),
			Math.max(0, Math.min(255, colorDark[1] + (colorLight[1] - colorDark[1]) * value)),
			Math.max(0, Math.min(255, colorDark[2] + (colorLight[2] - colorDark[2]) * value)),
			Math.max(0, Math.min(255, colorDark[3] + (colorLight[3] - colorDark[3]) * value)),
		];
	}

	return color;
}

export function convertColorDecToHex(color: number[]): string {
	return '#' + (((color[0] & 0xff) << 16) | ((color[1] & 0xff) << 8) | (color[2] & 0xff))
		.toString(16)
		.padStart(6, '0');
}

export function convertHexToRgb(hex: string): number[] {
	const color = parseInt(hex.substring(1), 16);
	return [(color >> 16) & 0xFF, (color >> 8) & 0xFF, color & 0xFF, 0xFF];
}

export function mixColors(frontRGBA: number[], bgRGBA: number[]): number[] {
	if (bgRGBA[3] < 20) {
		return frontRGBA.slice();
	} else if (frontRGBA[3] < 20) {
		return bgRGBA.slice();
	}

	const bgR = bgRGBA[0] / 255;
	const bgG = bgRGBA[1] / 255;
	const bgB = bgRGBA[2] / 255;
	const bgA = bgRGBA[3] / 255;

	const fgR = frontRGBA[0] / 255;
	const fgG = frontRGBA[1] / 255;
	const fgB = frontRGBA[2] / 255;
	const fgA = frontRGBA[3] / 255;

	const a = (1 - fgA) * bgA;
	const alpha = a + fgA;
	const r = (a * bgR + fgA * fgR) / alpha;
	const g = (a * bgG + fgA * fgG) / alpha;
	const b = (a * bgB + fgA * fgB) / alpha;

	return [
		Math.max(0, Math.min(255, (r * 255) | 0)),
		Math.max(0, Math.min(255, (g * 255) | 0)),
		Math.max(0, Math.min(255, (b * 255) | 0)),
		Math.max(0, Math.min(255, (alpha * 255) | 0))
	];
}