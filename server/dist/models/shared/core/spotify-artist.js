"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SpotifyArtist {
    constructor() {
    }
    GetID() {
        return this.id;
    }
    GetName() {
        return this.name;
    }
    static fromJSON(json) {
        return Object.assign(new SpotifyArtist(), json);
    }
}
exports.SpotifyArtist = SpotifyArtist;
