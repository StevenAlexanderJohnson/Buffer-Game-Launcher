<template>
  <div id="optionsContainer">
    <h1>Options</h1>
    <h2><u>Add Library Location</u></h2>
    <div id="bodyContent">
      <div class="flexContent">
        <table>
          <thead>
            <tr>
              <th>Added Library Paths</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in gameLibraries"
              v-bind:key="item"
              v-on:dblclick="RemovePath($event)"
            >
              <td>
                {{ item }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flexContent">
        <input type="text" name="pathInput" id="pathInput" />
        <br />
        <input type="button" value="Add Path" v-on:click="AddPath()" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Options",
  data() {
    return {
      gameLibraryList: [],
    };
  },
  mounted: function () {
    // Needed to collect data from the vuex store
    window.ipcRenderer.send("vuex-getLibrary");
    // Event handler for Vuex returning the library
    window.ipcRenderer.on("replyLibrary", (event, arg) => {
      this.gameLibraries = JSON.parse(arg);
      document.getElementById('pathInput').value = null;
    });
    window.ipcRenderer.on('errorLibrary', (event, arg) => {
      document.getElementById('pathInput').value = null;
      this.gameLibraries = JSON.parse(arg[1]);
      alert(arg[0]);
    });
  },
  methods: {
    AddPath: function () {
      window.ipcRenderer.send(
        "vuex-addLibrary",
        document.getElementById("pathInput").value
      );
    },
    RemovePath: function (event) {
      if(confirm("Remove " + event.currentTarget.innerText + '?')) {
        window.ipcRenderer.send(
          "vuex-removeLibrary",
          event.currentTarget.innerText
        );
      }
    },
  },
  computed: {
    gameLibraries: {
      get() {
        return this.gameLibraryList;
      },
      set(value) {
        this.gameLibraryList = value;
      },
    },
  },
};
</script>

<style scoped>
table {
  width: 300px;
  background-color: #666;
  margin-bottom: 50px;
}
thead {
  background-color: #222;
}
tbody {
  height: 300px;
  overflow: auto;
}
td {
  background-color: #555;
  cursor: pointer;
  user-select: none;
  max-height: 30px;
  transition: .1s;
}
td:hover {
  background-color: #222;
}
tr {
  padding: 5px;
  cursor: default;
}
#optionsContainer {
  overflow: auto;
  flex-grow: 1;
}
#bodyContent {
  display: flex;
  justify-content: center;
  vertical-align: middle;
  padding-left: 50px;
  padding-right: 50px;
  flex-direction: row;
  overflow: auto;
  flex-wrap: wrap;
}
.flexContent {
  margin-left: 50px;
  margin: 30px;
  min-height: 50px;
}
</style>