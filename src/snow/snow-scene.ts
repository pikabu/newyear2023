import {SnowMatrix} from "game/snow/snow-matrix";
import {SnowRenderer} from "game/snow/snow-renderer";
import {SnowLightnessCalc} from "game/snow/physics/snow-lightness-calc";
import {SnowDropShadowCalc} from "game/snow/physics/snow-drop-shadow-calc";
import {SnowGroundingCalc} from "game/snow/physics/snow-grounding-calc";
import {SnowGravityCalc} from "game/snow/physics/snow-gravity-calc";
import {MATRIX_PHYSICS_CALC_FRAME_DELAY} from "game/config";
import {SnowMatrixHistory} from "game/snow/snow-matrix-history";
import {SnowMatrixTransform} from "game/snow/snow-matrix-transform";

export class SnowScene {
	private readonly dropShadowCalc: SnowDropShadowCalc;
	private readonly lightnessCalc: SnowLightnessCalc;
	private readonly groupsCalc: SnowGroundingCalc;
	private readonly gravityCalc: SnowGravityCalc;

	private physicsCalcTimerId = 0;
	private needRender = true;
	private needResetChangedArea = false;
	private animationRequestId = 0;

	constructor(
		private readonly matrix: SnowMatrix,
		private readonly matrixHistory: SnowMatrixHistory,
		private readonly renderer: SnowRenderer
	) {
		const transform = new SnowMatrixTransform(this.matrix, this.matrixHistory);

		this.dropShadowCalc = new SnowDropShadowCalc(this.matrix);
		this.lightnessCalc = new SnowLightnessCalc(this.matrix);
		this.groupsCalc = new SnowGroundingCalc(this.matrix);
		this.gravityCalc = new SnowGravityCalc(this.matrix, transform);

		this.calcShadows();
		this.render();
	}

	requestRender(): void {
		this.calcShadows();
		this.requestPhysicsCalc(MATRIX_PHYSICS_CALC_FRAME_DELAY);
		this.needRender = true;
	}

	calcShadows() {
		const startTime = performance.now();
		this.dropShadowCalc.calc();
		this.lightnessCalc.calc();
		console.log('shadows', performance.now() - startTime);
		this.needRender = true;
	}

	calcPhysics() {
		const startTime = performance.now();
		let needCalcAgain = false;

		this.groupsCalc.calc();

		needCalcAgain ||= this.gravityCalc.calc();

		if (needCalcAgain) {
			this.requestPhysicsCalc(MATRIX_PHYSICS_CALC_FRAME_DELAY);
		}

		this.calcShadows();
		this.needRender = true;
		this.needResetChangedArea = true;
		console.log('physics', performance.now() - startTime);
	}

	private render: () => void = () => {
		cancelAnimationFrame(this.animationRequestId);

		if (!this.needRender) {
			this.animationRequestId = requestAnimationFrame(this.render);
			return;
		}

		this.needRender = false;

		const startTime = performance.now();
		this.renderer.renderItems([
			...this.matrix.getRenderList()
		]);
		console.log('render', performance.now() - startTime);

		this.animationRequestId = requestAnimationFrame(this.render);

		if (this.needResetChangedArea) {
			this.matrix.resetChangedArea();
			this.needResetChangedArea = false;
		}
	}

	private requestPhysicsCalc(timeout: number): void {
		clearTimeout(this.physicsCalcTimerId);
		this.physicsCalcTimerId = window.setTimeout(this.calcPhysics.bind(this), timeout);
	}
}