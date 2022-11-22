<script>
	import { error, feedback } from '$lib/stores';
	import Nav from '$lib/Nav.svelte';
	import { onDestroy, onMount } from 'svelte';

	let localError, localFeedback;
	let errorTimeout, feedbackTimeout;
	let showError = false,
		showFeedback = false;
	let disabledAnimations = true;

	const unsubscribeError = error.subscribe((val) => {
		if (val) {
			clearTimeout(errorTimeout);
			showError = true;
			localError = val;
			errorTimeout = setTimeout(() => (showError = false), 4000);
		}
	});

	const unsubscribeFeedback = feedback.subscribe((val) => {
		if (val) {
			clearTimeout(feedbackTimeout);
			showFeedback = true;
			localFeedback = val;
			feedbackTimeout = setTimeout(() => (showFeedback = false), 4000);
		}
	});

	onMount(() => {
		setTimeout(() => {
			disabledAnimations = false;
		}, 500);
	});

	onDestroy(() => {
		unsubscribeError();
		unsubscribeFeedback();
	});
</script>

<Nav />
{#if unsubscribeError}
	<div
		class="alert alert--error"
		class:alert--on={showError}
		class:alert--disabled-animation={disabledAnimations}
	>
		{localError?.content}
	</div>
{/if}
{#if unsubscribeFeedback}
	<div
		class="alert alert--feedback"
		class:alert--on={showFeedback}
		class:alert--disabled-animation={disabledAnimations}
	>
		{localFeedback?.content}
	</div>
{/if}
<main>
	<slot />
</main>
<footer>
	<a href="https://canicjusz.github.io/" target="_blank">Pri la kreinto</a> |
	<a href="/kontakto">Kontakto</a>
	|
	<a href="/privateco">Privateca Politiko</a> | <a href="/regularo">Regularo</a>
</footer>

<style lang="sass" global>
@use "sass:map"
@use '../styles/abstracts/colors' 
@use '../styles/abstracts/typography'
@use '../styles/abstracts/functions'
@use '../styles/abstracts/misc'
@use '../styles/abstracts/mixins'
@use '../styles/components'

input[type="search"]::-webkit-search-decoration,
input[type="search"]::-webkit-search-cancel-button,
input[type="search"]::-webkit-search-results-button,
input[type="search"]::-webkit-search-results-decoration 
  display: none

*
  white-space: normal

html
  scroll-behavior: smooth

html,
body
  margin: 0
  padding: 0
  height: 100%

main
  position: relative
  background: colors.$szary
  padding-top: 50px
  min-height: map.get(misc.$heights, "but-header-footer")

footer
  font-size: typography.$small
  box-sizing: border-box
  border-top: functions.generateBorder(1, colors.$szarszy)
  background: colors.$bialy
  height: 50px
  color: colors.$czarny
  @include mixins.center(false, true)
  font-family: typography.$open-sans

a
  @include components.link

svg
  flex-shrink: 0
  fill: currentColor

input[type="checkbox"]
  flex-shrink: 0
  margin: 0
  @include mixins.square(1rem)

input:not(input[type="checkbox"])
  width: 100%
  border: none
  background: transparent
  border-bottom: functions.generateBorder(2, colors.$szarszy)
  overflow: visible
  font-size: typography.$normal
  height: 42px
  box-sizing: border-box
  font-family: typography.$raleway
  outline: none
  transition: 0.3s border-color

  &:focus
    border-color: colors.$niebieski-link

.select-container
  font-size: typography.$normal
  font-family: typography.$raleway
  --padding: 0
  --borderRadius: 0
  --border: none
  --inputColor: #{colors.$czarny}
  --background: transparent
  --inputFontSize: #{typography.$normal}
  --clearSelectRight: 0
  --multiSelectPadding: 0

  .selectContainer
    transition: 0.3s border-color
    --borderColor: #{colors.$szarszy}
    border-bottom: functions.generateBorder(2, var(--borderColor)) !important

    &.focused
      --borderColor: #{colors.$niebieski-link}

.alert
  text-align: center
  min-width: 200px
  left: 50%
  transform: translate(-50%, 0)
  background: colors.$crimson
  border-radius: 10px
  border: functions.generateBorder(1, colors.$bordowy)
  padding: 10px
  position: fixed
  opacity: 0
  z-index: 2
  transition-property: opacity, transform
  transition-duration: 0.5s, 0.5s
  color: colors.$bialy
  font-family: typography.$open-sans
  font-size: typography.$normal

  &--disabled-animation
    transition-duration: 0s, 0s

  &--on
    transform: translate(-50%, 60px)
    opacity: 1

  &--error
    background: colors.$crimson
    border: functions.generateBorder(1, colors.$bordowy)

  &--feedback
    background: colors.$zielony
    border: functions.generateBorder(1, colors.$ciemny-zielony)

.spinner__container, .nothing__container, .url-error  
  box-sizing: border-box
  font-size: typography.$normal
  font-family: typography.$open-sans
  @include mixins.center(false, true)
  padding-top: 20px
  width: 100%
  min-width: 70px

.spinner__container
  min-height: 70px

.url-error
  padding: 20px 10px
  color: colors.$crimson

.error
  margin-top: 5px
  font-family: typography.$open-sans
  color: colors.$crimson

.mv-icon
  background-image: url("/mv-icon.png")
  background-size: contain
  @include mixins.square(24px)
  background-position: center

.pagination
  padding: 20px
  box-sizing: border-box

  &__scroll
    overflow: auto

  &__container
    justify-content: center
    display: flex
    column-gap: 10px
    min-width: max-content
    width: 100%

  &__element
    box-sizing: border-box
    border-radius: 50%
    @include mixins.square(30px)
    border: functions.generateBorder(2, colors.$niebieski-link)
    @include mixins.center(false, false)
    color: colors.$niebieski-link
    text-decoration: none
    font-family: typography.$open-sans

    &--selected
      background: colors.$niebieski-link
      color: colors.$bialy

  &--bottom
    position: absolute
    bottom: 0
    width: 100%

small
  font-size: typography.$small

.multiSelectItem
  max-width: 180px !important

</style>
