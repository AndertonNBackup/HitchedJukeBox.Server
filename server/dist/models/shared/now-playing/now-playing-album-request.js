"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NowPlayingAlbumRequest {
    constructor(album) {
        this.Album = album;
    }
    GetAlbum() {
        return this.Album;
    }
    static FromObject(request) {
        return new NowPlayingAlbumRequest(request.Album);
    }
}
exports.NowPlayingAlbumRequest = NowPlayingAlbumRequest;
