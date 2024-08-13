

const Store = require('electron-store');
const store = new Store();

const getValue = (key) => { return store.get(key) };
const deleteValue = (key) => { store.delete(key) };
const setValue = (key, value) => { store.set(key, value) };




const clearAllStore = () => { store.clear() };

module.exports = { getValue, deleteValue, setValue, clearAllStore };