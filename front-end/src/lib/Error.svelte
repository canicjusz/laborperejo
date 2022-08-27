<script>
	export let value;
</script>

<div class="error" class:error--invisible={!value}>{value}</div>

<style lang="sass">
.error--invisible
	height: 0
	width: 0
	margin: 0
	visibility: hidden
	//had to add this cuz of some wired bug in ofertkreilo
	overflow-wrap: normal
</style>
