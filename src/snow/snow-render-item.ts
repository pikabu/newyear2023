import {SnowCell} from "game/snow/snow-cell";

export class SnowRenderItem {
	constructor(readonly cell: SnowCell, readonly x: number, readonly y: number, readonly z: number) {
	}
}