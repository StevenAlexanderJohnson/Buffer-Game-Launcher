<template>
  <div id="tilebar">
    <button v-on:click="Minimize()">
      <img src="../assets/minimize.png" alt="minimize" />
    </button>
    <button v-on:click="Maximize()">
      <img src="../assets/restore.png" alt="maximize" />
    </button>
    <button id="close" v-on:click="Close()">
      <img src="../assets/close.png" alt="close" />
    </button>
  </div>
</template>

<script>
export default {
  name: "Tilebar",
  methods: {
    Close: function () {
      window.ipcRenderer.send("quit-app");
    },
    Minimize: function () {
      window.ipcRenderer.send("minimize");
    },
    Maximize: function () {
      this.isMaximized = !this.isMaximized;
      window.ipcRenderer.send("maximize");
    },
  },
};
</script>

<style>
#tilebar {
  display: flex;
  justify-content: right;
  height: 30px;
  width: 100%;
  background-color: #111;
  -webkit-user-select: none;
  user-select: none;
  -webkit-app-region: drag;
}
button {
  height: 100%;
  outline: none;
  border-style: none;
  background-color: #222;
  padding: 5px;
  transition: 0.1s;
  user-select: none;
  -webkit-user-select: none;
  -webkit-app-region: none;
}
button:hover {
  background-color: #333;
}
#close {
  -webkit-user-select: none;
  user-select: none;
  -webkit-app-region: none;
}
#close:hover {
  background-color: #f33;
}
img {
  -webkit-user-drag: none;
  width: auto;
  height: 100%;
  box-sizing: border-box;
  filter: invert(1);
}
</style>