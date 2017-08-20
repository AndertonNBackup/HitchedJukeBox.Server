"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SpotifyAlbum {
    constructor() {
    }
    GetID() {
        return this.id;
    }
    GetName() {
        return this.name;
    }
    static fromJSON(json) {
        return Object.assign(new SpotifyAlbum(), json);
    }
}
exports.SpotifyAlbum = SpotifyAlbum;
