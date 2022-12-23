import {SnowMatrix} from "game/snow/snow-matrix";
import {SnowCursor} from "game/snow/snow-cursor";
import {AddBallTool} from "game/editor/tools/add-ball-tool";
import {AddCubeTool} from "game/editor/tools/add-cube-tool";
import {EraseBallTool} from "game/editor/tools/erase-ball-tool";
import {AddPropTool} from "game/editor/tools/add-prop-tool";
import {SnowScene} from "game/snow/snow-scene";
import {PointerHandler, PointerService} from "game/editor/pointer-service";
import {PaintTool} from "game/editor/tools/paint-tool";
import {PAINT_COLORS} from "game/config";
import "game/editor/view/tool.scss";
import "game/editor/view/color.scss";
import "game/editor/view/prop.scss";
import "game/editor/view/button.scss";
import {SnowMatrixHistory} from "game/snow/snow-matrix-history";
import {SnowProps} from "game/snow/snow-props";
import {SnowMatrixTransform} from "game/snow/snow-matrix-transform";
import {AddCylinderTool} from "game/editor/tools/add-cylinder-tool";
import {SnowGround} from "game/snow/shapes/snow-ground";
import {Shapes} from "game/snow/shapes/shapes";
import {AddCircleTool} from "game/editor/tools/add-circle-tool";
import {AddConeTool} from "game/editor/tools/add-cone-tool";
import {EraseCircleTool} from "game/editor/tools/erase-circle-tool";
import {EraseRectTool} from "game/editor/tools/erase-rect-tool";

enum Tool {
	ADD,
	ERASE,
	PAINT,
	PROPS
}

export class EditorTools {
	private readonly pointerService: PointerService;

	private readonly addBallTool: AddBallTool;
	private readonly addCubeTool: AddCubeTool;
	private readonly addCylinderTool: AddCylinderTool;
	private readonly addCircleTool: AddCircleTool;
	private readonly addConeTool: AddConeTool;

	private readonly eraseBallTool: EraseBallTool;
	private readonly eraseCircleTool: EraseCircleTool;
	private readonly eraseRectTool: EraseRectTool;

	private readonly addPropTool: AddPropTool;
	private readonly paintTool: PaintTool;

	private lastAddShape: Shapes = Shapes.SPHERE;
	private lastEraseShape: Shapes = Shapes.SPHERE;
	private lastPaintShape: Shapes = Shapes.CIRCLE;

	private currentTool: Tool;

	constructor(
		private readonly cont: HTMLElement,
		private readonly scene: SnowScene,
		private readonly matrix: SnowMatrix,
		private readonly cursor: SnowCursor,
		private readonly matrixHistory: SnowMatrixHistory,
		private readonly props: SnowProps
	) {

		this.pointerService = new PointerService(this.cursor.canvas);
		const transform = new SnowMatrixTransform(this.matrix, this.matrixHistory, this.props);

		this.addBallTool = new AddBallTool(this.matrix, transform, this.cursor);
		this.addBallTool.observe(this.processChange);

		this.addCubeTool = new AddCubeTool(this.matrix, transform, this.cursor);
		this.addCubeTool.observe(this.processChange);

		this.addCylinderTool = new AddCylinderTool(this.matrix, transform, this.cursor);
		this.addCylinderTool.observe(this.processChange);

		this.addCircleTool = new AddCircleTool(this.matrix, transform, this.cursor);
		this.addCircleTool.observe(this.processChange);

		this.addConeTool = new AddConeTool(this.matrix, transform, this.cursor);
		this.addConeTool.observe(this.processChange);

		this.eraseBallTool = new EraseBallTool(this.matrix, transform, this.cursor);
		this.eraseBallTool.observe(this.processChange);

		this.eraseCircleTool = new EraseCircleTool(this.matrix, transform, this.cursor);
		this.eraseCircleTool.observe(this.processChange);

		this.eraseRectTool = new EraseRectTool(this.matrix, transform, this.cursor);
		this.eraseRectTool.observe(this.processChange);

		this.addPropTool = new AddPropTool(this.matrix, this.matrixHistory, this.cursor, this.props);
		this.addPropTool.observe(this.processChange);

		this.paintTool = new PaintTool(this.matrix, this.matrixHistory, this.cursor);
		this.paintTool.observe(this.processChange);

		this.mount();
		this.setBrushSize(7);
	}

	setBrushSize(size: number): void {
		const realSize = size * 2;
		this.addBallTool.size = realSize;
		this.addCubeTool.size = realSize;
		this.addCylinderTool.size = realSize;
		this.addCircleTool.size = realSize;
		this.addConeTool.size = realSize;

		this.eraseBallTool.size = realSize;
		this.eraseCircleTool.size = realSize;
		this.eraseRectTool.size = realSize;

		this.paintTool.size = realSize / 2;
		this.selectSize(size);
	}

	setAddSnowTool(): void {
		this.currentTool = Tool.ADD;
		this.showShapes([Shapes.SPHERE, Shapes.CIRCLE, Shapes.RECT, Shapes.CONE, Shapes.CYLINDER]);
		this.setShape(this.lastAddShape);
		this.selectTool('add');
	}

	setEraseTool(): void {
		this.currentTool = Tool.ERASE;
		this.showShapes([Shapes.SPHERE, Shapes.CIRCLE, Shapes.RECT]);
		this.setShape(this.lastEraseShape);
		this.selectTool('erase');
	}

	setPaintTool(): void {
		this.currentTool = Tool.PAINT;
		this.showShapes([Shapes.CIRCLE]);
		this.setShape(this.lastPaintShape);
		this.selectTool('paint');
	}

	setPropTool(): void {
		this.currentTool = Tool.PROPS;
		this.showShapes([]);
		this.selectTool('props');
	}

	setShape(shape: Shapes): void {
		this.selectShape(shape);

		let tool: PointerHandler;

		if (this.currentTool === Tool.ADD) {
			switch (shape) {
				case Shapes.SPHERE:
					tool = this.addBallTool;
					break;
				case Shapes.RECT:
					tool = this.addCubeTool;
					break;
				case Shapes.CYLINDER:
					tool = this.addCylinderTool;
					break;
				case Shapes.CIRCLE:
					tool = this.addCircleTool;
					break;
				case Shapes.CONE:
					tool = this.addConeTool;
					break;
			}
			this.lastAddShape = shape;
		} else if (this.currentTool === Tool.ERASE) {
			switch (shape) {
				case Shapes.SPHERE:
					tool = this.eraseBallTool;
					break;
				case Shapes.CIRCLE:
					tool = this.eraseCircleTool;
					break;
				case Shapes.RECT:
					tool = this.eraseRectTool;
					break;
			}

			this.lastEraseShape = shape;
		} else if (this.currentTool === Tool.PAINT) {
			switch (shape) {
				case Shapes.CIRCLE:
					tool = this.paintTool;
					break;
			}

			this.lastPaintShape = shape;
		}

		if (tool) {
			this.pointerService.setHandler(tool);
		}
	}

	async setAddPropTool(imgUrl: string, propCode: number): Promise<void> {
		let propImg = this.props.getPropByCode(propCode);
		if (propImg === null) {
			await this.props.setProp(propCode, imgUrl);
		}

		this.addPropTool.setPropCode(propCode);
		this.pointerService.setHandler(this.addPropTool);

		const selectedColorEl = this.cont.querySelector('.snow-editor-prop_selected');
		selectedColorEl && selectedColorEl.classList.remove('snow-editor-prop_selected');

		this.cont.querySelector(`.snow-editor-prop[data-value="${propCode}"]`)
			.classList
			.toggle('snow-editor-prop_selected');

		this.cont.querySelector('.snow-editor__props').classList.remove('snow-editor__props_show');
	}

	setColorTool(colorIndex: number): void {
		this.paintTool.setColor(PAINT_COLORS[colorIndex][0], PAINT_COLORS[colorIndex][1]);
		this.pointerService.setHandler(this.paintTool);

		const selectedColorEl = this.cont.querySelector('.snow-editor-color_selected');
		selectedColorEl && selectedColorEl.classList.remove('snow-editor-color_selected');

		this.cont.querySelector(`.snow-editor-color[data-value="${colorIndex + 1}"]`)
			.classList
			.toggle('snow-editor-color_selected');

		this.cont.querySelector('.snow-editor__colors').classList.remove('snow-editor__colors_show');
	}

	private processChange = () => {
		this.scene.requestRender();
		this.matrixHistory.saveState();
	};

	private mount(): void {
		this.cont.querySelectorAll<HTMLElement>('.snow-editor-tool').forEach(el => {
			switch (el.dataset.role) {
				case 'add':
					el.onclick = () => this.setAddSnowTool();
					break;
				case 'erase':
					el.onclick = () => this.setEraseTool();
					break;
				case 'paint':
					el.onclick = () => this.setPaintTool();
					break;
				case 'props':
					el.onclick = () => this.setPropTool();
					break;
			}
		});

		this.cont.querySelectorAll<HTMLElement>('.snow-editor__size').forEach(el => {
			el.onclick = () => this.setBrushSize(parseInt(el.dataset.value, 10));
		});

		this.cont.querySelectorAll<HTMLElement>('.snow-editor-color').forEach(el => {
			el.onclick = () => this.setColorTool(parseInt(el.dataset.value, 10) - 1);
		});

		this.cont.querySelectorAll<HTMLElement>('.snow-editor-prop').forEach(el => {
			el.onclick = () => this.setAddPropTool(
				window.getComputedStyle(el).backgroundImage.match(/url\(["']?([^"')]+)["']?\)/)[1],
				parseInt(el.dataset.value, 10)
			);
		});

		this.cont.querySelectorAll<HTMLElement>('.snow-editor__shape').forEach(el => {
			el.onclick = () => this.setShape(el.dataset.shape as Shapes);
		});

		this.cont.querySelector<HTMLElement>('.snow-editor-button[data-role="undo"]').onclick = () => {
			if (!('structuredClone' in window)) {
				alert('Ваш браузер не поддерживает эту функцию');
				return;
			}
			this.matrixHistory.restoreState();
			this.scene.requestRender();
		};

		this.cont.querySelector<HTMLElement>('.snow-editor-button[data-role="clear"]').onclick = () => {
			if (confirm('Вы действительно хотите удалить все?')) {
				this.matrix.clear();
				new SnowGround().fill(this.matrix);
				this.matrixHistory.reset();
				this.scene.requestRender();
			}
		};
	}

	private showShapes(shapes: Shapes[]): void {
		document.querySelectorAll<HTMLElement>('.snow-editor__shape').forEach(el => {
			el.hidden = !shapes.includes(el.dataset.shape as Shapes);
		});
	}

	private selectTool(name: string): void {
		const selectedEl = this.cont.querySelector('.snow-editor-tool_selected');
		selectedEl && selectedEl.classList.remove('snow-editor-tool_selected');

		this.cont.querySelector('.snow-editor__colors').classList.toggle('snow-editor__colors_show', name === 'paint');
		this.cont.querySelector('.snow-editor__props').classList.toggle('snow-editor__props_show', name === 'props');

		this.cont.querySelector(`.snow-editor-tool[data-role="${name}"]`)
			.classList.add('snow-editor-tool_selected');
	}

	private selectSize(value: number): void {
		const selectedEl = this.cont.querySelector('.snow-editor__size_selected');
		selectedEl && selectedEl.classList.remove('snow-editor__size_selected');
		this.cont.querySelector(`.snow-editor__size[data-value="${value}"]`)
			.classList.add('snow-editor__size_selected');
	}

	private selectShape(shape: Shapes): void {
		const selectedEl = this.cont.querySelector('.snow-editor__shape_selected');
		selectedEl && selectedEl.classList.remove('snow-editor__shape_selected');
		this.cont.querySelector(`.snow-editor__shape[data-shape="${shape}"]`)
			.classList.add('snow-editor__shape_selected');
	}
}