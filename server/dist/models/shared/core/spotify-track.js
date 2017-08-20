"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SpotifyTrack {
    constructor() {
    }
    GetID() {
        return this.Track.id;
    }
    GetName() {
        return this.Track.name;
    }
    GetArtistName() {
        return this.Track.artists[0].name;
    }
    GetImage() {
        return this.Track.album.images[1].url;
    }
    static fromJSON(json) {
        return Object.assign(new SpotifyTrack(), json);
    }
}
exports.SpotifyTrack = SpotifyTrack;
