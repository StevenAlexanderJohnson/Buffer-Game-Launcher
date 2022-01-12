// import { createStore } from 'vuex'
import Vuex from 'vuex';

let store = new Vuex({
        state() {
            return {
                currentPage: 'home',
                libraryList: []
            }
        },
        getters: {
            getLibraryList(state) {
                return state.libraryList;
            }
        },
        mutations: {
            setPage(state, data) {
                if (state.currentPage == data) {
                    state.currentPage = 'home';
                }
                else {
                    state.currentPage = data;
                }
            },
            setLibraryList(state, data) {
                state.libraryList = data;
            },
            addLibrary(state, data) {
                state.libraryList.push(data);
                console.log(state.libraryList);
            },
            removeLibrary(state, data) {
                let index = state.libraryList.indexOf(data);
                if (index !== -1) {
                    state.libraryList.splice(index, 1);
                }
            }
        },
    })

module.exports = {
    store: store
}

// const store = createStore({
//     state() {
//         return {
//             currentPage: 'home',
//             libraryList: []
//         }
//     },
//     getters: {
//         getLibraryList(state) {
//             return state.libraryList;
//         }
//     },
//     mutations: {
//         setPage(state, data) {
//             if(state.currentPage == data) {
//                 state.currentPage = 'home';
//             }
//             else {
//                 state.currentPage = data;
//             }
//         },
//         setLibraryList(state, data) {
//             state.libraryList = data;
//         },
//         addLibrary(state, data) {
//             state.libraryList.push(data);
//             console.log(state.libraryList);
//         },
//         removeLibrary(state, data) {
//             let index = state.libraryList.indexOf(data);
//             if(index !== -1) {
//                 state.libraryList.splice(index, 1);
//             }
//         }
//     },
// });
