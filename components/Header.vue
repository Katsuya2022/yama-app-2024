<template>
  <v-app-bar color="primary">
    <v-app-bar-nav-icon 
      variant="text"
      @click.stop="$emit('toggle-drawer')">
    </v-app-bar-nav-icon>

    <v-app-bar-title>
      <span id="logo-text">yamaApp</span>
    </v-app-bar-title>
  </v-app-bar>
</template>

<script>
export default {
  name: "Header",
  emits: ['toggle-drawer']
}
</script>

<style lang="scss">
#logo-text {
  font-size: 28px;
  font-weight: bold;
  // padding: 0 1px;
}
</style>