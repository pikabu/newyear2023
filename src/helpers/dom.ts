export function createElementFromHtml(html: string): HTMLElement {
	const tmp = document.createElement('template');
	tmp.innerHTML = html;
	return tmp.content.firstElementChild as HTMLElement;
}