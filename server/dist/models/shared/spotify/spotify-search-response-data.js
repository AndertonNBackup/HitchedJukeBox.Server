"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SpotifySearchResponseData {
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
        let container = jsonData.body.tracks || jsonData.body.artists || jsonData.body.albums;
        return Object.assign(new SpotifySearchResponseData(), container);
    }
}
exports.SpotifySearchResponseData = SpotifySearchResponseData;
