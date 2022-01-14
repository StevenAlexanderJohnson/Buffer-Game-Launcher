<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <div v-if="installedGames.length == 0 && searchingFiles">
      <p>Searching for games.</p>
    </div>
    <div v-else-if="installedGames.length == 0 && !searchingFiles">
      <p>No games are installed or you have to select a directory to search.</p>
    </div>
    <div class="tableContainer" v-else>
      <table>
        <thead>
          <tr>
            <th>
              <div>Installed Games</div>
              <input
                type="text"
                name="searchBar"
                id="searchBar"
                placeholder="Search"
                v-model="searchBarValue"
              />
            </th>
          </tr>
        </thead>
        <tbody id="tableBody">
          <div v-for="game in installedGames" v-bind:key="game[1]">
            <tr
              v-if="game[0].toLowerCase().includes(searchBarValue.toLowerCase()) || searchBarValue == ''"
              v-on:dblclick="LaunchGame($event)"
              v-on:click="OpenAccordion($event)"
            >
              <div hidden>{{ game[1] }}</div>
              <td>
                {{ game[0].replace(".exe", "") }}
              </td>
            </tr>
            <div class="accordion">
              <div class="accordionOption">
                <label for="launchOptions">Launch Options: </label>
                <input type="text" name="launchOptions" id="launchOptions" />
              </div>
            </div>
          </div>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data() {
    return {
      gameList: [],
      fileSearch: false,
      searchBar: "",
    };
  },
  computed: {
    installedGames: {
      get() {
        return this.gameList;
      },
      set(value) {
        this.gameList = value;
      },
    },
    searchingFiles: {
      get() {
        return this.fileSearch;
      },
      set(value) {
        this.fileSearch = value;
      },
    },
    searchBarValue: {
      get() {
        return this.searchBar;
      },
      set(value) {
        this.searchBar = value;
      },
    },
  },
  mounted: function () {
    let getData = setInterval(function () {
      window.ipcRenderer.send("vuex-getGameList");
      this.searchingFiles = true;
    }, 50);
    window.ipcRenderer.on("acknowledgeGameList", () => {
      clearInterval(getData);
    });
    window.ipcRenderer.on("replyGameList", (event, arg) => {
      this.installedGames = JSON.parse(arg);
      this.searchingFiles = false;
    });
  },
  methods: {
    LaunchGame: function (event) {
      window.ipcRenderer.send(
        "launch-game",
        event.currentTarget.children[0].innerText
      );
    },
    OpenAccordion: function (event) {
      // If the accordion is already open close it, else close all other accordions and open the selected
      if (event.currentTarget.nextSibling.classList.contains("opened")) {
        event.currentTarget.nextSibling.classList.remove("opened");
      } else {
        let openedAccordions = document.getElementsByClassName("opened");
        for (let i = 0; i < openedAccordions.length; i++) {
          if (openedAccordions[i].classList.contains("opened")) {
            openedAccordions[i].classList.remove("opened");
            break;
          }
        }
        event.currentTarget.nextSibling.classList.add("opened");
      }
    },
  },
};
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.tableContainer {
  height: 100%;
}
table {
  margin-top: 5px;
  margin-bottom: 10px;
  margin-left: 10%;
  margin-right: 10%;
  background-color: #555;
}
thead {
  height: 100%;
  background-color: #555;
}
thead tr {
  margin: 5px;
  background-color: #222;
}
thead tr th {
  margin: 3px;
  align-self: center;
  padding: 5px;
}
tbody::-webkit-scrollbar {
  width: 15px;
}
tbody::-webkit-scrollbar-track {
  background: #888;
}
tbody::-webkit-scrollbar-thumb {
  background-color: #111;
  border-radius: 12px;
  border: 2px solid #888;
}
tbody {
  display: block;
  height: calc(100vh - 200px);
  background-color: #555;
  overflow-y: auto;
}
tbody tr {
  display: table;
  table-layout: fixed;
  width: 100%;
  margin-bottom: 5px;
  background-color: #444;
  cursor: pointer;
}
tbody tr td {
  padding: 10px;
  width: 100%;
  text-align: center;
  transition: 0.05s;
  user-select: none;
}
tbody tr td:hover {
  background-color: #111;
}
.hello {
  flex-grow: 1;
  display: table;
  overflow: auto;
}
.accordion {
  max-height: 0px;
  display: flex;
  overflow: hidden;
  height: 100px;
  transition: 0.2s ease-in-out;
}
.opened {
  max-height: 200px;
}

input[type="text"] {
  height: 30px;
  background-color: #424242;
  color: #eee;
  font-size: 20px;
  text-align: center;
  outline: none;
}
.accordionOption {
  display: flex;
  align-items: center;
}
</style>
