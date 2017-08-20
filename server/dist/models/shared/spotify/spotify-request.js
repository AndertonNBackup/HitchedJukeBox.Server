"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SpotifyRequest {
    constructor(type, value) {
        this.RequestType = type;
        this.RequestValue = value;
    }
    GetType() {
        return this.RequestType;
    }
    GetTypeText() {
        return SpotifyRequest.fetchTypeText(this.RequestType);
    }
    GetValue() {
        return this.RequestValue;
    }
    static fetchTypeText(type) {
        let TypeText = '';
        switch (type) {
            case SpotifyRequest.SEARCH:
                TypeText = "Search";
                break;
            case SpotifyRequest.FETCH_TRACKS:
                TypeText = "FetchTracks";
                break;
            case SpotifyRequest.FETCH_TRACKS:
                TypeText = "FetchAlbums";
                break;
            default:
        }
        return TypeText;
    }
    static FromObject(request) {
        return new SpotifyRequest(request.RequestType, request.RequestValue);
    }
    static fetchCommandHook(appPrefix, servicePrefix) {
        let commandHook = appPrefix + "." + servicePrefix + "." + SpotifyRequest.COMMAND_HOOK;
        return commandHook;
    }
}
SpotifyRequest.SEARCH = 1;
SpotifyRequest.FETCH_TRACKS = 2;
SpotifyRequest.FETCH_ALBUMS = 3;
SpotifyRequest.COMMAND_HOOK = "Spotify.Request";
exports.SpotifyRequest = SpotifyRequest;
