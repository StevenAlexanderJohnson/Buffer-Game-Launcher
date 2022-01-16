<template>
  <div class="hello">
    <div id="confirmation">
      <p>Do you want to launch: </p>
      <p id="confirm-game-name"></p>
      <div id="confirm-game-path" hidden></div>
      <div class="buttonConfirmation">
        <input type="button" value="Yes" v-on:click="LaunchGame()" />
        <input type="button" value="No" v-on:click="CloseConfirmation()"/>
      </div>
    </div>

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
              <div class="container">
                <input
                  type="text"
                  name="searchBar"
                  id="searchBar"
                  placeholder="Search"
                  v-model="searchBarValue"
                />
                <input
                  type="button"
                  value="Random Game"
                  v-on:click="LaunchRandomGame()"
                />
                <div>
                  <label for="SortOptions">Sort Filters:</label>
                  <select
                    name="SortOptions"
                    id="SortOptions"
                    v-model="sortOptionValue"
                  >
                    <option value="name asc">Name Asc.</option>
                    <option value="name dsc">Name Dsc.</option>
                  </select>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody id="tableBody">
          <div v-for="game in installedGames" v-bind:key="game[1]">
            <tr
              v-if="
                game[0].toLowerCase().includes(searchBarValue.toLowerCase()) ||
                searchBarValue == ''
              "
              v-on:dblclick="ConfirmGame($event)"
            >
              <td>
                {{ game[0].replace(".exe", "") }}
                <img
                  class="arrowIcon"
                  src="../assets/arrow_icon.png"
                  alt="arrow"
                  v-on:click="OpenAccordion($event)"
                />
              </td>
              <div hidden>{{ game[1] }}</div>
            </tr>
            <div class="accordion">
              <div class="accordionOption">
                <label for="launchOptions">Launch Options: </label>
                <input
                  type="text"
                  name="launchOptions"
                  id="launchOptions"
                  placeholder="temp disabled"
                  disabled
                />
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
  name: "GameList",
  props: {
    msg: String,
  },
  data() {
    return {
      gameList: [],
      fileSearch: false,
      searchBar: "",
      sortOption: "",
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
    sortOptionValue: {
      get() {
        return this.sortOption;
      },
      set(value) {
        this.sortOption = value;
        if (value === "name asc") {
          console.log(
            this.installedGames.sort((a, b) =>
              a[0] > b[0] ? 1 : b[0] > a[0] ? -1 : 0
            )
          );
        } else if (value === "name dsc") {
          console.log(
            this.installedGames.sort((a, b) =>
              a[0] < b[0] ? 1 : b[0] < a[0] ? -1 : 0
            )
          );
        }
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
    ConfirmGame: function(event) {
      document.getElementById("confirm-game-name").innerText = event.currentTarget.children[0].innerText;
      document.getElementById('confirm-game-path').innerText = event.currentTarget.children[1].innerText;
      document.getElementById("confirmation").style.display = 'flex';
    },
    CloseConfirmation: function() {
      document.getElementById('confirmation').style.display = 'none';
    },
    LaunchGame: function () {
      window.ipcRenderer.send(
        "launch-game",
        document.getElementById('confirm-game-path').innerText
      );
      document.getElementById('confirmation').style.display = "none";
    },
    LaunchRandomGame: function () {
      let tds = document.getElementsByTagName("tr");
      console.log(tds);
      let randomGame = tds[Math.floor(Math.random() * tds.length - 1) + 1];
      console.log(randomGame);
      randomGame.dispatchEvent(new MouseEvent("dblclick"));
    },
    OpenAccordion: function (event) {
      let parent = event.currentTarget.closest("tr");
      // If the accordion is already open close it, else close all other accordions and open the selected
      if (parent.nextSibling.classList.contains("opened")) {
        parent.nextSibling.classList.remove("opened");
      } else {
        let openedAccordions = document.getElementsByClassName("opened");
        for (let i = 0; i < openedAccordions.length; i++) {
          if (openedAccordions[i].classList.contains("opened")) {
            openedAccordions[i].classList.remove("opened");
            break;
          }
        }
        parent.nextSibling.classList.add("opened");
      }
      console.log(event.currentTarget.classList);
      if (event.currentTarget.classList.contains("flipped")) {
        event.currentTarget.classList.remove("flipped");
        return;
      }
      let flippedArrows = document.getElementsByClassName("arrowIcon");
      for (let i = 0; i < flippedArrows.length; i++) {
        if (flippedArrows[i].classList.contains("flipped")) {
          flippedArrows[i].classList.remove("flipped");
          break;
        }
      }
      event.currentTarget.classList.add("flipped");
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
  min-width: 100%;
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
  position: relative;
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
  position: relative;
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
.accordionOption {
  display: flex;
  align-items: center;
}
.arrowIcon {
  position: absolute;
  right: 20px;
  height: 20px;
  width: auto;
  transition: 0.2s ease-in-out;
}
.flipped {
  transform: rotate(180deg);
}
.container {
  display: flex;
  justify-content: space-around;
  align-items: center;
}
#confirmation {
  position: absolute;
  display: none;
  justify-content: top;
  flex-direction: column;
  align-items: center;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 60vh;
  height: 30vh;
  background-color: #222;
  border: 2px solid darkgray;
  z-index: 999;
}
.buttonConfirmation {
  display: flex;
  justify-content: space-around;
  width: 200px;
}
</style>
