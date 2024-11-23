<template>
  <main>
    <Header @toggle-drawer="drawer = !drawer" />
    <SideMenu :drawer="drawer" @toggle-drawer="drawer = !drawer" />
    <slot />
  </main>
</template>

<script>
export default {
  data: () => ({
    drawer: false
  })
}
</script>