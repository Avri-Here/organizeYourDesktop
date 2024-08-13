

const Store = require('electron-store');
const store = new Store();

const setValue = (key, value) => { store.set(key, value) };


const getValue = (key) => { return store.get(key) };


const clearAllStore = () => { store.clear() };

module.exports = { setValue, getValue, clearAllStore };