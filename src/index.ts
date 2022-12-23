import {Editor} from "game/editor/editor";
import {Viewer} from "game/viewer/viewer";

document.addEventListener('DOMContentLoaded', () => {
	const cont = document.querySelector<HTMLElement>('.snow-editor-container');
	if (cont) {
		const editor = new Editor(parseInt(cont.dataset.userId, 10), cont.dataset.userName);
		cont.appendChild(editor.el);
	}

	const viewCont = document.querySelector<HTMLElement>('.snow-view-container');
	if (viewCont) {
		const viewer = new Viewer();
		viewer.load(document.querySelector('script#snow-data').textContent).then();
		viewCont.appendChild(viewer.el);
	}
});
