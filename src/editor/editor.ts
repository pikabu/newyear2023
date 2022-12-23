import {SnowMatrix} from "game/snow/snow-matrix";
import {MATRIX_COLS, MATRIX_LEVELS, MATRIX_ROWS} from "game/config";
import {SnowScene} from "game/snow/snow-scene";
import {SnowRenderer} from "game/snow/snow-renderer";
import {SnowCursor} from "game/snow/snow-cursor";
import {EditorTools} from "game/editor/editor-tools";
import {RenderOptions} from "game/snow/render-options";
import "game/editor/view/editor.scss"
import view from "game/editor/view/editor.hbs"
import {createElementFromHtml} from "game/helpers/dom";
import {SnowMatrixHistory} from "game/snow/snow-matrix-history";
import {SnowProps} from "game/snow/snow-props";
import {SnowGround} from "game/snow/shapes/snow-ground";
import {EditorSave} from "game/editor/editor-save";
import {EditorDestroy} from "game/editor/editor-destroy";

export class Editor {
	readonly el: HTMLElement;
	private readonly matrix: SnowMatrix;
	private readonly matrixHistory: SnowMatrixHistory;
	private readonly scene: SnowScene;
	private readonly renderOptions: RenderOptions;
	private readonly renderer: SnowRenderer;
	private readonly cursor: SnowCursor;
	private readonly props: SnowProps;
	private readonly tools: EditorTools;
	private readonly save: EditorSave;
	private readonly destroy: EditorDestroy;

	constructor(userId: number, userName: string) {
		this.el = createElementFromHtml(view({
			userId,
			userName,
			props: new Array(84).fill(null).map((v, i) => ({i: i + 1}))
		}));
		this.props = new SnowProps();
		this.matrix = new SnowMatrix(MATRIX_COLS, MATRIX_ROWS, MATRIX_LEVELS);
		new SnowGround().fill(this.matrix);

		this.matrixHistory = new SnowMatrixHistory(this.matrix);
		this.renderOptions = new RenderOptions();
		this.renderer = new SnowRenderer(this.matrix, this.renderOptions, this.props);
		this.cursor = new SnowCursor(this.renderer, this.matrix);
		this.scene = new SnowScene(this.matrix, this.matrixHistory, this.renderer);
		this.tools = new EditorTools(this.el, this.scene, this.matrix, this.cursor, this.matrixHistory, this.props);
		this.save = new EditorSave(this.el, this.matrix, this.matrixHistory, userId);
		this.destroy = new EditorDestroy(this.el, userId);

		const cont = this.el.querySelector('.snow-editor__canvas');
		cont.appendChild(this.renderer.canvas);
		cont.appendChild(this.cursor.canvas);

		window.addEventListener('beforeunload', (e): string => {
			if (!this.matrixHistory.hasChanges() || this.matrixHistory.isSavedToServer) {
				return null;
			}

			const msg = '';
			e.returnValue = msg;
			return msg;
		});

		this.tools.setAddSnowTool();
	}
}