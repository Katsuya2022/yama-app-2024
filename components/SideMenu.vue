<template>
  <div>
    <v-navigation-drawer :model-value="drawer" @input="$emit('update:model-value', $event.target.value)">
      <v-list nav @click:select="test">
        <v-list-item prepend-icon="mdi-view-dashboard" title="ホーム" value="home" to="/"></v-list-item>
        <v-list-item prepend-icon="mdi-forum" title="テスト" value="test" to="/Test"></v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
export default {
  name: "SideMenu",
  data() {
    return {
      a: true
    }
  },
  props: {
    drawer: {
      type: Boolean,
      required: true
    }
  },
  // watch: {
  //   drawer: {
  //     handler(newVal) {
  //       this.$emit('update:drawer', newVal)
  //     },
  //     immediate: true,
  //   }
  // }
}
</script>

<style lang="scss">
#logo-text {
  font-size: 28px;
  font-weight: bold;
  // padding: 0 1px;
}
</style>