"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SpotifyAlbumRequest {
    constructor(artistID) {
        this.artistID = artistID;
    }
    GetArtistID() {
        return this.artistID;
    }
    static FromObject(request) {
        return new SpotifyAlbumRequest(request.artistID);
    }
}
exports.SpotifyAlbumRequest = SpotifyAlbumRequest;
