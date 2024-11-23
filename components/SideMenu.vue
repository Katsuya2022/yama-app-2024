<template>
  <div>
    <!-- 下記のclient-onlyは Hydration node mismatch のエラーを回避するためのもの-->
    <client-only>
    <v-navigation-drawer
      :model-value="drawer"
      @update:model-value="$emit('toggle-drawer')"
      temporary
    >
      <v-list nav>
        <v-list-item prepend-icon="mdi-view-dashboard" title="ホーム" value="home" to="/"></v-list-item>
        <v-list-item prepend-icon="mdi-forum" title="保有証券一覧" value="holdingsSecuritiesList" to="/securities/HoldingsSecuritiesList"></v-list-item>
        <v-list-item prepend-icon="mdi-forum" title="テスト" value="test" to="/Test"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    </client-only>
  </div>
</template>

<script>
export default {
  name: "SideMenu",
  emits: ["toggle-drawer"],
  props: {
    drawer: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<style lang="scss">
#logo-text {
  font-size: 28px;
  font-weight: bold;
  // padding: 0 1px;
}
</style>