import {SnowMatrix} from "game/snow/snow-matrix";
import {SnowMatrixHistory} from "game/snow/snow-matrix-history";

export class EditorSave {
	private readonly saveBtn: HTMLButtonElement;
	constructor(
		private readonly cont: HTMLElement,
		private readonly matrix: SnowMatrix,
		private readonly history: SnowMatrixHistory,
		private readonly userId: number
	) {
		this.saveBtn = this.cont.querySelector<HTMLButtonElement>('button[data-role="save"]');
		this.saveBtn.onclick = () => this.save();
	}

	async save(): Promise<void> {
		if (this.userId === 0) {
			return;
		}

		this.saveBtn.disabled = true;

		this.cont.querySelectorAll<HTMLElement>('.snow-editor__message[data-group="save"]').forEach(el => el.hidden = true);

		const out: number[] = [];
		const mat = this.matrix.matrix;
		for (let y = 0; y < this.matrix.rows; y++) {
			const lineX = mat[y];
			for (let x = 0; x < this.matrix.cols; x++) {
				const lineZ = lineX[x];
				for (let z = 0; z < this.matrix.levels; z++) {
					const cell = lineZ[z];
					if (cell === null) {
						continue;
					}

					out.push(
						y, x, z,
						Math.floor(cell.extraRadius * 10),
						Math.floor(cell.darkness * 255),
						...(cell.colorLight === null ? [0, 0, 0, 0] : cell.colorLight),
						...(cell.colorDark === null ? [0, 0, 0, 0] : cell.colorDark),
						cell.prop
					);
				}
			}
		}

		this.history.isSavedToServer = true;

		const formData  = new FormData();
		formData.append('f', new Blob([new Uint8Array(out)]));

		try {
			const res = await (await fetch('./save.ajax.php', {
				method: 'POST',
				body: formData
			})).json();
			if (!res.result) {
				console.error(res.message);
				this.saveBtn.disabled = false;
				this.showError();
				return;
			}
		} catch (e) {
			console.error(e);
			this.saveBtn.disabled = false;
			this.showError();
			return;
		}

		this.showSuccess();
		this.saveBtn.disabled = false;
	}

	private showError(): void {
		this.cont.querySelectorAll<HTMLElement>('.snow-editor__message[data-group="save"]')
			.forEach(el => el.hidden = el.classList.contains('snow-editor__message_success'));
	}

	private showSuccess(): void {
		this.cont.querySelectorAll<HTMLElement>('.snow-editor__message[data-group="save"]')
			.forEach(el => el.hidden = el.classList.contains('snow-editor__message_error'));
	}
}