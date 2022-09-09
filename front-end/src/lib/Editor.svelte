<script>
	import { onMount, onDestroy } from 'svelte';
	import { error } from './stores';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Image from '@tiptap/extension-image';
	import Link from '@tiptap/extension-link';
	import Placeholder from '@tiptap/extension-placeholder';
	import Popup from './Popup.svelte';

	let element;
	let editor;
	let focused = false;

	let showLinkPopup = false;
	let showImagePopup = false;

	let link = '';
	let image = '';

	export let placeholder;
	export let value;

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				StarterKit,
				Image,
				Link.configure({
					openOnClick: false
				}),
				Placeholder.configure({
					placeholder
				})
			],
			content: value,
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editor = editor;
			},
			onUpdate: () => (value = editor.getHTML()),
			onFocus: () => (focused = true),
			onBlur: () => (focused = false)
		});
	});

	const addImage = () => {
		if (/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(image)) {
			editor.chain().focus().setImage({ src: image }).run();
			showImagePopup = false;
		} else {
			error.change({
				error: 'Nur Ligeblas bildoj kun etendaĵo jpg, jpeg, png, webp, avif, gif, svg.'
			});
		}
	};

	const addLink = () => {
		editor.chain().focus().extendMarkRange('link').setLink({ href: link, target: '_blank' }).run();
		showLinkPopup = false;
	};

	const toggleLink = () => {
		const isLink = editor.isActive('link');
		if (isLink) {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
		} else {
			showLinkPopup = true;
		}
	};

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});
</script>

<div class="editor__container" class:editor__container--focused={focused}>
	{#if editor}
		<div class="editor__menu menu">
			<button
				on:click={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
				class:active={editor.isActive('heading', { level: 1 })}
				title="Titolo 1"
				class="menu__button"
				type="button"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0H24V24H0z" /><path
						d="M13 20h-2v-7H4v7H2V4h2v7h7V4h2v16zm8-12v12h-2v-9.796l-2 .536V8.67L19.5 8H21z"
					/></svg
				>
			</button>
			<button
				on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				class:active={editor.isActive('heading', { level: 2 })}
				title="Titolo 2"
				class="menu__button"
				type="button"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0H24V24H0z" /><path
						d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2zm14.5 4c2.071 0 3.75 1.679 3.75 3.75 0 .857-.288 1.648-.772 2.28l-.148.18L18.034 18H22v2h-7v-1.556l4.82-5.546c.268-.307.43-.709.43-1.148 0-.966-.784-1.75-1.75-1.75-.918 0-1.671.707-1.744 1.606l-.006.144h-2C14.75 9.679 16.429 8 18.5 8z"
					/></svg
				>
			</button>
			<button
				on:click={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
				class:active={editor.isActive('heading', { level: 3 })}
				title="Titolo 3"
				class="menu__button"
				type="button"
				><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0H24V24H0z" /><path
						d="M22 8l-.002 2-2.505 2.883c1.59.435 2.757 1.89 2.757 3.617 0 2.071-1.679 3.75-3.75 3.75-1.826 0-3.347-1.305-3.682-3.033l1.964-.382c.156.806.866 1.415 1.718 1.415.966 0 1.75-.784 1.75-1.75s-.784-1.75-1.75-1.75c-.286 0-.556.069-.794.19l-1.307-1.547L19.35 10H15V8h7zM4 4v7h7V4h2v16h-2v-7H4v7H2V4h2z"
					/></svg
				>
			</button>
			<button
				on:click={() => editor.chain().focus().setParagraph().run()}
				class:active={editor.isActive('paragraph')}
				title="Paragrafo"
				class="menu__button"
				type="button"
				><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0h24v24H0z" /><path
						d="M12 6v15h-2v-5a6 6 0 1 1 0-12h10v2h-3v15h-2V6h-3zm-2 0a4 4 0 1 0 0 8V6z"
					/></svg
				>
			</button>
			<button
				on:click={() => editor.chain().focus().toggleBlockquote().run()}
				class:active={editor.isActive('blockquote')}
				title="Citaĵo"
				class="menu__button"
				type="button"
				><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0h24v24H0z" /><path
						d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"
					/></svg
				>
			</button>
			<button
				on:click={() => editor.chain().focus().toggleBold().run()}
				class:active={editor.isActive('bold')}
				title="Grase"
				class="menu__button"
				type="button"
				><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0h24v24H0z" /><path
						d="M8 11h4.5a2.5 2.5 0 1 0 0-5H8v5zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.498 4.498 0 0 1 18 15.5zM8 13v5h5.5a2.5 2.5 0 1 0 0-5H8z"
					/></svg
				>
			</button>
			<button
				on:click={() => editor.chain().focus().toggleItalic().run()}
				class:active={editor.isActive('italic')}
				title="Kursive"
				class="menu__button"
				type="button"
				><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0h24v24H0z" /><path
						d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15z"
					/></svg
				>
			</button>
			<button
				on:click={toggleLink}
				title="Ligilo"
				class="menu__button"
				disabled={editor.view.state.selection.empty}
				type="button"
				><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0h24v24H0z" /><path
						d="M18.364 15.536L16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636 9.88 4.222a7 7 0 0 1 9.9 9.9l-1.415 1.414zm-2.828 2.828l-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414zm-.708-10.607l1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z"
					/></svg
				>
			</button>
			<button
				on:click={() => (showImagePopup = true)}
				title="Aldoni bildon"
				class="menu__button"
				type="button"
				><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0h24v24H0z" /><path
						d="M20 5H4v14l9.292-9.294a1 1 0 0 1 1.414 0L20 15.01V5zM2 3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H2.992A.993.993 0 0 1 2 20.007V3.993zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
					/></svg
				></button
			>
			<button
				on:click={() => editor.chain().focus().toggleBulletList().run()}
				class:active={editor.isActive('bulletList')}
				title="Bula listo"
				class="menu__button"
				type="button"
				><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0h24v24H0z" /><path
						d="M8 4h13v2H8V4zM4.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 6.9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM8 11h13v2H8v-2zm0 7h13v2H8v-2z"
					/></svg
				>
			</button>
			<button
				class="menu__button"
				on:click={() => editor.chain().focus().toggleOrderedList().run()}
				class:active={editor.isActive('orderedList')}
				title="Numerita listo"
				type="button"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0h24v24H0z" /><path
						d="M8 4h13v2H8V4zM5 3v3h1v1H3V6h1V4H3V3h2zM3 14v-2.5h2V11H3v-1h3v2.5H4v.5h2v1H3zm2 5.5H3v-1h2V18H3v-1h3v4H3v-1h2v-.5zM8 11h13v2H8v-2zm0 7h13v2H8v-2z"
					/></svg
				>
			</button>
			<button
				class="menu__button"
				on:click={() => editor.chain().focus().sinkListItem('listItem').run()}
				disabled={!editor.can().sinkListItem('listItem')}
				title="Ingi"
				type="button"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0h24v24H0z" /><path
						d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z"
					/></svg
				>
			</button>
			<button
				class="menu__button"
				on:click={() => editor.chain().focus().liftListItem('listItem').run()}
				disabled={!editor.can().liftListItem('listItem')}
				title="Malingi"
				type="button"
				><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0h24v24H0z" /><path
						d="M10.828 12l4.95 4.95-1.414 1.414L8 12l6.364-6.364 1.414 1.414z"
					/></svg
				>
			</button>
			<button
				class="menu__button"
				on:click={() => editor.chain().focus().setHardBreak().run()}
				title="Nova linio"
				type="button"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0h24v24H0z" /><path
						d="M15 18h1.5a2.5 2.5 0 1 0 0-5H3v-2h13.5a4.5 4.5 0 1 1 0 9H15v2l-4-3 4-3v2zM3 4h18v2H3V4zm6 14v2H3v-2h6z"
					/></svg
				>
			</button>
			<button
				class="menu__button"
				on:click={() => editor.chain().focus().undo().run()}
				disabled={!editor.can().undo()}
				title="Malfari"
				type="button"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0h24v24H0z" /><path
						d="M5.828 7l2.536 2.536L6.95 10.95 2 6l4.95-4.95 1.414 1.414L5.828 5H13a8 8 0 1 1 0 16H4v-2h9a6 6 0 1 0 0-12H5.828z"
					/></svg
				></button
			>
			<button
				class="menu__button"
				on:click={() => editor.chain().focus().redo().run()}
				type="button"
				disabled={!editor.can().redo()}
				title="Refari"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0h24v24H0z" /><path
						d="M18.172 7H11a6 6 0 1 0 0 12h9v2h-9a8 8 0 1 1 0-16h7.172l-2.536-2.536L17.05 1.05 22 6l-4.95 4.95-1.414-1.414L18.172 7z"
					/></svg
				>
			</button>
		</div>
	{/if}

	<div bind:this={element} class="editor" />
</div>
<Popup show={showImagePopup}>
	<h1 class="popup__title popup__title--blue">Aldoni bildon</h1>
	<input type="url" class="popup__input" placeholder="Ligilo al bildo" bind:value={image} />
	<div class="popup__buttons">
		<button
			on:click={addImage}
			class="popup__button popup__button--blue popup__button--round"
			type="button">Aldoni</button
		>
		<button
			on:click={() => (showImagePopup = false)}
			class="popup__button popup__button--red popup__button--round"
			type="button">Nuligi</button
		>
	</div>
</Popup>
<Popup show={showLinkPopup}>
	<h1 class="popup__title popup__title--blue">Aldoni ligilon</h1>
	<input type="url" class="popup__input" placeholder="Ligilo" bind:value={link} />
	<div class="popup__buttons">
		<button
			on:click={addLink}
			class="popup__button popup__button--blue popup__button--round"
			type="button">Aldoni</button
		>
		<button
			on:click={() => (showLinkPopup = false)}
			class="popup__button popup__button--red popup__button--round"
			type="button">Nuligi</button
		>
	</div>
</Popup>

<style lang="sass">
@use '../styles/abstracts/typography' 
@use '../styles/abstracts/colors' 
@use '../styles/abstracts/functions'
@use '../styles/abstracts/mixins'

.editor
	max-height: 450px
	overflow: auto
	font-family: typography.$raleway
	margin-top: 10px

	&__container
		padding: 10px
		border-radius: 5px
		border: functions.generateBorder(2, colors.$szarszy)
		transition: border-color 0.5s

		&--focused
			border-color: colors.$niebieski-link

		.menu
			display: flex
			flex-wrap: wrap

			&__button
				background: transparent
				border: none
				border-radius: 5px
				padding: 0
				margin: 2px
				@include mixins.square(32px)
				@include mixins.center(false, false)

				svg
						fill: currentColor

				&:disabled
					background: colors.$szary
					color: colors.$szarszy

				&.active
					background: colors.$czarny
					color: colors.$bialy

	img 
		max-width: 100%

:global
	.ProseMirror 
		outline: none

		&.is-editor-empty:first-child::before
			color: #adb5bd
			content: attr(data-placeholder)
			float: left
			height: 0
			pointer-events: none
</style>
