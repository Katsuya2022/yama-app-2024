<template>
  <main>
    <Header @toggle-drawer="drawer = !drawer" />
    <SideMenu :drawer="drawer" :home="home" />
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