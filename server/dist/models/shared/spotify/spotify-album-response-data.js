"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SpotifyAlbumResponseData {
    constructor() {
    }
    GetItems() {
        return this.items;
    }
    GetLimit() {
        return this.limit;
    }
    GetTotal() {
        return this.total;
    }
    GetOffset() {
        return this.offset;
    }
    loadFromData(jsonData) {
        let container = jsonData.body;
        return Object.assign(new SpotifyAlbumResponseData(), container);
    }
}
exports.SpotifyAlbumResponseData = SpotifyAlbumResponseData;
