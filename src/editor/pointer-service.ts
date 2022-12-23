export interface PointerHandler {
	start?: (x: number, y: number) => void;
	drag?: (dx: number, dy: number, x: number, y: number) => void;
	move?: (x: number, y: number) => void;
	leave?: () => void;
	stop?: () => void;
	click?: (x: number, y: number) => void;
}

const MAX_CLICK_DELTA = 4;

export class PointerService {
	private touchX = 0;
	private touchY = 0;
	private startX = 0;
	private startY = 0;
	private maxDeltaX = 0;
	private maxDeltaY = 0;
	private touchId = 0;
	private handler: PointerHandler | null = null;

	constructor(private el: HTMLElement) {
		this.assignPointerEvents();
	}

	setHandler(handler: PointerHandler): void {
		this.handler = handler;
	}

	private assignPointerEvents(): void {
		if ('ontouchstart' in document) {
			this.el.addEventListener('touchstart', this.handleTouchStart, {passive: false});
			this.el.addEventListener('touchmove', this.handleTouchMove, {passive: false});
			this.el.addEventListener('touchend', this.handleTouchEnd, {passive: false});
		} else {
			this.el.addEventListener('mousedown', this.handleMouseDown);
			this.el.addEventListener('mousemove', this.handleMouseMove);
			this.el.addEventListener('mouseleave', this.handleMouseLeave);
		}
	}

	private handleTouchStart = (e: TouchEvent): void => {
		if (this.touchId !== 0) {
			return;
		}

		const touch = e.targetTouches[0];
		this.touchId = touch.identifier;
		this.touchX = touch.clientX;
		this.touchY = touch.clientY;

		this.maxDeltaX = 0;
		this.maxDeltaY = 0;

		const elPos = this.el.getBoundingClientRect();
		this.startX = touch.clientX - elPos.left;
		this.startY = touch.clientY - elPos.top;

		this.handler?.start?.(this.startX, this.startY);
	}

	private handleTouchMove = (e: TouchEvent): void => {
		const touch = this.getTouchById(e.targetTouches);
		if (!touch) {
			return;
		}

		const dx = this.touchX - touch.clientX;
		const dy = this.touchY - touch.clientY;
		this.maxDeltaX = Math.max(dx, this.maxDeltaX);
		this.maxDeltaY = Math.max(dy, this.maxDeltaY);
		this.handler?.drag?.(dx, dy, this.startX - dx, this.startY - dy);
	}

	private handleTouchEnd = (e: TouchEvent): void => {
		const touch = this.getTouchById(e.targetTouches);
		if (!touch) {
			this.touchId = 0;
			this.handler?.stop?.();
		}

		if (this.maxDeltaX < MAX_CLICK_DELTA && this.maxDeltaY < MAX_CLICK_DELTA) {
			this.handler?.click?.(this.startX - this.maxDeltaX, this.startY - this.maxDeltaY);
		}
	}

	private handleMouseDown = (e: MouseEvent): void => {
		this.touchX = e.clientX;
		this.touchY = e.clientY;

		const elPos = this.el.getBoundingClientRect();
		this.startX = e.clientX - elPos.left;
		this.startY = e.clientY - elPos.top;

		this.maxDeltaX = 0;
		this.maxDeltaY = 0;

		document.addEventListener('mousemove', this.handleMouseDrag, {capture: true});
		document.addEventListener('mouseup', this.handleMouseUp, {capture: true});

		this.handler?.start?.(this.startX, this.startY);
		this.handler?.click?.(this.startX, this.startY);
	}

	private handleMouseDrag = (e: MouseEvent): void => {
		const dx = this.touchX - e.clientX;
		const dy = this.touchY - e.clientY;

		this.maxDeltaX = Math.max(dx, this.maxDeltaX);
		this.maxDeltaY = Math.max(dy, this.maxDeltaY);

		this.handler?.drag?.(dx, dy, this.startX - dx, this.startY - dy);
	}

	private handleMouseMove = (e: MouseEvent): void => {
		const elPos = this.el.getBoundingClientRect();

		const dx = e.clientX - elPos.left;
		const dy = e.clientY - elPos.top;

		this.maxDeltaX = Math.max(dx, this.maxDeltaX);
		this.maxDeltaY = Math.max(dy, this.maxDeltaY);

		this.handler?.move?.(dx, dy);
	}

	private handleMouseUp = (): void => {
		document.removeEventListener('mousemove', this.handleMouseDrag, {capture: true});
		document.removeEventListener('mouseup', this.handleMouseUp, {capture: true});

		this.handler?.stop?.();
	}

	private handleMouseLeave = (): void => {
		this.handler?.leave?.();
	}

	private getTouchById(list: TouchList): (Touch | undefined) {
		for (let i = 0; i < list.length; i++) {
			if (list[i].identifier === this.touchId) {
				return list[i];
			}
		}

		return undefined;
	}
}