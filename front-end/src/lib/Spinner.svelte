<div class="spinner" />

<style lang="sass">
@use '../styles/abstracts/colors'
@use '../styles/abstracts/mixins'
@use '../styles/abstracts/functions'

.spinner
  display: inline-block
  @include mixins.square(40px)
  border-radius: 50%
  border: functions.generateBorder(4, colors.$navy)
  border-top-color: transparent
  animation: spin 0.75s linear 0s infinite normal none running
  
@keyframes spin 
  from 
    transform: rotate(0)

  to 
    transform: rotate(360deg)
</style>
