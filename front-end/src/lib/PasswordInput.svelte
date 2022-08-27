<script>
	export let value;
	export let disabled;
	export let placeholder;
	export let autocomplete;
	export let id;

	let show = false;

	const switchInputs = () => {
		if (!disabled) show = !show;
	};
</script>

<div class="password__container">
	{#if show}
		<input
			name="password"
			type="text"
			bind:value
			{id}
			{autocomplete}
			{placeholder}
			{disabled}
			class="password"
		/>
		<svg
			on:click={switchInputs}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			class="password__eye"
			width="24"
			height="24"
			><path fill="none" d="M0 0h24v24H0z" /><path
				d="M12 3c5.392 0 9.878 3.88 10.819 9-.94 5.12-5.427 9-10.819 9-5.392 0-9.878-3.88-10.819-9C2.121 6.88 6.608 3 12 3zm0 16a9.005 9.005 0 0 0 8.777-7 9.005 9.005 0 0 0-17.554 0A9.005 9.005 0 0 0 12 19zm0-2.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
			/></svg
		>
	{:else}
		<input
			name="password"
			type="password"
			bind:value
			{id}
			{autocomplete}
			{placeholder}
			{disabled}
			class="password"
		/>
		<svg
			on:click={switchInputs}
			xmlns="http://www.w3.org/2000/svg"
			class="password__eye"
			viewBox="0 0 24 24"
			width="24"
			height="24"
			><path fill="none" d="M0 0h24v24H0z" /><path
				d="M17.882 19.297A10.949 10.949 0 0 1 12 21c-5.392 0-9.878-3.88-10.819-9a10.982 10.982 0 0 1 3.34-6.066L1.392 2.808l1.415-1.415 19.799 19.8-1.415 1.414-3.31-3.31zM5.935 7.35A8.965 8.965 0 0 0 3.223 12a9.005 9.005 0 0 0 13.201 5.838l-2.028-2.028A4.5 4.5 0 0 1 8.19 9.604L5.935 7.35zm6.979 6.978l-3.242-3.242a2.5 2.5 0 0 0 3.241 3.241zm7.893 2.264l-1.431-1.43A8.935 8.935 0 0 0 20.777 12 9.005 9.005 0 0 0 9.552 5.338L7.974 3.76C9.221 3.27 10.58 3 12 3c5.392 0 9.878 3.88 10.819 9a10.947 10.947 0 0 1-2.012 4.592zm-9.084-9.084a4.5 4.5 0 0 1 4.769 4.769l-4.77-4.769z"
			/></svg
		>
	{/if}
</div>

<style lang="sass">
.password
	
	&__eye
		right: 5px
		height: 42px
		position: absolute

	&__container
		position: relative
</style>
