import {SnowMatrix} from "game/snow/snow-matrix";

export class EditorDestroy {
	private readonly destroyDtn: HTMLButtonElement;
	constructor(
		private readonly cont: HTMLElement,
		private readonly userId: number
	) {
		this.destroyDtn = this.cont.querySelector<HTMLButtonElement>('button[data-role="destroy"]');
		this.destroyDtn.onclick = () => this.destroy();
	}

	async destroy(): Promise<void> {
		if (this.userId === 0) {
			return;
		}

		this.destroyDtn.disabled = true;

		this.cont.querySelectorAll<HTMLElement>('.snow-editor__message[data-group="destroy"]').forEach(el => el.hidden = true);

		try {
			const res = await (await fetch('./destroy.ajax.php', {
				method: 'POST'
			})).json();
			if (!res.result) {
				console.error(res.message);
				this.destroyDtn.disabled = false;
				this.showError();
				return;
			}
		} catch (e) {
			console.error(e);
			this.destroyDtn.disabled = false;
			this.showError();
			return;
		}

		this.showSuccess();
		this.destroyDtn.disabled = false;
	}

	private showError(): void {
		this.cont.querySelectorAll<HTMLElement>('.snow-editor__message[data-group="destroy"]')
			.forEach(el => el.hidden = el.classList.contains('snow-editor__message_success'));
	}

	private showSuccess(): void {
		this.cont.querySelectorAll<HTMLElement>('.snow-editor__message[data-group="destroy"]')
			.forEach(el => el.hidden = el.classList.contains('snow-editor__message_error'));
	}
}