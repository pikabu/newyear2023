export class SnowProps {
	private readonly props: Map<number, HTMLImageElement> = new Map<number, HTMLImageElement>();

	getPropByCode(code: number): HTMLImageElement | null {
		return this.props.get(code) || null;
	}

	async setProp(code: number, url: string): Promise<HTMLImageElement> {
		return new Promise(r => {
			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.onload = () => r(img);
			img.src = url;
			this.props.set(code, img);
		});
	}
}