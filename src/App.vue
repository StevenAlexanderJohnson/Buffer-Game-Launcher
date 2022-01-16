<template>
  <div class="main">
  <Tilebar />
    <div class="flexContainer">
      <Sidebar />
      <GameList v-if="page == 'home'" msg="Welcome to Buffer" />
      <Options v-else-if="page == 'options'" />
    </div>
  </div>
</template>

<script>
import GameList from "./components/GameList.vue";
import Sidebar from "./components/Sidebar.vue";
import Tilebar from './components/Tilebar.vue';
import Options from './components/Options.vue';
export default {
  name: "App",
  data() {
    return {
      pageValue: 'home',
    }
  },
  mounted() {
    window.ipcRenderer.on('replyPage', (event, args) => {
      this.page = args;
    });
  },
  computed: {
    page: {
      get() {
        return this.pageValue;
      },
      set(value) {
        this.pageValue = value;
      }
    }
  },
  components: {
    GameList,
    Sidebar,
    Tilebar,
    Options
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #ccc;
}
html,
body {
  background-color: #333;
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
body {
  display: table;
}
.flexContainer {
	display: flex;
	flex-direction: row;
  height: calc(100vh - 30px);
}
input[type="button"] {
  border-radius: 0px;
  background-color: #555;
  color: #eee;
  height: 25px;
  border: none;
}
input[type="button"]:hover {
  background-color: #333;
}
input[type="text"] {
  height: 30px;
  background-color: #424242;
  color: #eee;
  border: 2px solid black;
  font-size: 20px;
  text-align: center;
  outline: none;
}
</style>
