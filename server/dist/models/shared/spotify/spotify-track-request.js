"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SpotifyTrackRequest {
    constructor(albumID) {
        this.albumID = albumID;
    }
    GetAlbumID() {
        return this.albumID;
    }
    static FromObject(request) {
        return new SpotifyTrackRequest(request.albumID);
    }
}
exports.SpotifyTrackRequest = SpotifyTrackRequest;
