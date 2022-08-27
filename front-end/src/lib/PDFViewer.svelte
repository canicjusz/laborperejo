<script>
	import * as pdfjs from 'pdfjs-dist';
	import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url';
	import Spinner from '$lib/Spinner.svelte';

	if (pdfjs.GlobalWorkerOptions) pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

	export let url;
	let canvasContainer;
	let loading = true;

	const createCanvas = ({ height, width }) => {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.height = height;
		canvas.width = width;
		canvasContainer.appendChild(canvas);
		return ctx;
	};

	function renderPage(page) {
		const viewport = page.getViewport({ scale: 1 });
		const ctx = createCanvas(viewport);

		var renderContext = {
			canvasContext: ctx,
			viewport: viewport
		};

		const renderTask = page.render(renderContext);
		renderTask.promise.then(() => (loading = false));
	}

	const renderPages = (pdfDoc) => {
		for (var num = 1; num <= pdfDoc.numPages; num++) pdfDoc.getPage(num).then(renderPage);
	};

	const removeChildren = () => {
		while (canvasContainer.firstChild) {
			canvasContainer.removeChild(canvasContainer.lastChild);
		}
	};

	const getDocument = (scopedUrl) => {
		loading = true;
		removeChildren();

		const document = pdfjs.getDocument(scopedUrl);
		document.promise.then(renderPages);
	};

	$: if (canvasContainer) getDocument(url);
</script>

<div bind:this={canvasContainer} id="canvasContainer" />
{#if loading}
	<div class="spinner__container">
		<Spinner />
	</div>
{/if}

<style lang="sass">
@use '../styles/abstracts/mixins'
@use '../styles/abstracts/colors'

#canvasContainer
	padding: 10px
	background: colors.$szarszy
	border-radius: 50%
	text-align: center
	max-height: 70vh
	overflow-y: auto

:global
	canvas
		display: inline-block
		max-width: 100%
</style>
