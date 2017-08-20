"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SpotifySearchRequest {
    constructor(type, search) {
        this.Type = type;
        this.SearchValue = search;
    }
    GetType() {
        return this.Type.id;
    }
    GetTypeText() {
        return this.Type.name;
    }
    GetSearchValue() {
        return this.SearchValue;
    }
    static FromObject(request) {
        return new SpotifySearchRequest(request.Type, request.SearchValue);
    }
}
SpotifySearchRequest.ST_SONG = 0;
SpotifySearchRequest.ST_ALBUM = 1;
SpotifySearchRequest.ST_ARTIST = 2;
exports.SpotifySearchRequest = SpotifySearchRequest;
