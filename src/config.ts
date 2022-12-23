import {convertHexToRgb} from "game/helpers/color";

export const SCALE = 2;
export const IMG_PROPS_SCALE = 1;

export const MATRIX_COLS = 90;
export const MATRIX_ROWS = 130;
export const MATRIX_LEVELS = 40;
export const MATRIX_CELL_SIZE = 4 * SCALE;
export const MATRIX_PHYSICS_CALC_FRAME_DELAY = 20;
export const MATRIX_FALLING_CELLS_PER_CALC = 5;

export const MATRIX_BALL_MIN_RADIUS = 6 * SCALE;
export const MATRIX_BALL_MAX_RADIUS = MATRIX_BALL_MIN_RADIUS + 3 * SCALE;

export const SNOW_SPHERE_REDUCE_CELLS_FACTOR = 0;//0.1;
export const SNOW_SPHERE_MAX_RADIUS = MATRIX_LEVELS >> 1;

export const SNOW_MAX_DARKNESS = 0.1;
export const SNOW_LIGHT_MAX_TRACE_PATH_Y = 15;
export const SNOW_LIGHT_MAX_TRACE_PATH_X = 10;

export const SNOW_LIGHT_COLOR = convertHexToRgb('#ffffff');
export const SNOW_DARK_COLOR = convertHexToRgb('#9fb8c9');

export const SNOW_SHADOW_LIGHT_COLOR = convertHexToRgb('#eef6fc');
export const SNOW_SHADOW_DARK_COLOR = convertHexToRgb('#a7c1d3');

export const SNOW_BLUR_SIZE = SCALE;

export const HISTORY_MAX_RECORDS = 20;

export const PAINT_COLORS: number[][][] = [
	[convertHexToRgb('#ff0000'), convertHexToRgb('#aa0000')],
	[convertHexToRgb('#fdf63c'), convertHexToRgb('#c5c719')],
	[SNOW_LIGHT_COLOR, SNOW_DARK_COLOR],
	[convertHexToRgb('#5cff41'), convertHexToRgb('#32c719')],
	[convertHexToRgb('#5dd7ff'), convertHexToRgb('#259cc3')],
	[convertHexToRgb('#5f7dff'), convertHexToRgb('#2542be')],
	[convertHexToRgb('#a155ff'), convertHexToRgb('#5c0ebc')],
	[convertHexToRgb('#ff4af9'), convertHexToRgb('#c10abb')],
	[convertHexToRgb('#ff538c'), convertHexToRgb('#c21a51')],
	[convertHexToRgb('#505050'), convertHexToRgb('#272727')],
	[convertHexToRgb('#ffae00'), convertHexToRgb('#c78c19')],
	[convertHexToRgb('#b1ff6c'), convertHexToRgb('#73be30')],
];

export const PAINT_COLOR_ALPHA = 128;

export const SNOW_BORDER_SHADOW_COLOR = '#a7c1d3';
export const SNOW_BORDER_SHADOW_DISTANCE = 3 * SCALE;

export const SNOW_DROP_SHADOW_DISTANCE_BY_RADIUS_FACTOR = 0.4;
export const SNOW_DROP_SHADOW_RADIUS_FACTOR = 1.2;

export const CURSOR_ADD_COLOR = '#99EE99';
export const CURSOR_DEL_COLOR = '#CC5555';
export const CURSOR_CHANGE_COLOR = '#00AAFF';

export const RENDER_AREA_MATRIX_INDENT_CELLS = Math.max(
	SNOW_LIGHT_MAX_TRACE_PATH_Y,
	SNOW_LIGHT_MAX_TRACE_PATH_X
);
