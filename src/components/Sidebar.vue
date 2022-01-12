<template>
  <div class="sidebar">
    <div class="imageContainer">
      <img
        id="settingsCog"
        v-on:click="SetPage('options')"
        src="../assets/settings.png"
        alt=""
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "Sidebar",
  methods: {
    SetPage(value) {
      window.ipcRenderer.send("vuex-set-page", value);
    },
  },
};
</script>

<style scoped>
.sidebar {
  background-color: #444;
  width: 100px;
}

#settingsCog {
  padding: 15px;
  width: 100px;
  height: 100px;
  box-sizing: border-box;
  transition: 0.5s;
}
#settingsCog:hover {
  transform: rotate(90deg);
}
.imageContainer {
  display: flex;
  transition: 0.2s;
}
.imageContainer:active {
  transform: scale(0.8);
}
.containerChild {
  padding: 15px;
  width: 100px;
  height: 100px;
  box-sizing: border-box;
  transition: 0.5s;
  -webkit-user-drag: none;
}
</style>