"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SpotifyAlbumResponse {
    constructor(id, items, limit, total, offset) {
        this.id = id;
        this.Items = items;
        this.Limit = limit;
        this.Total = total;
        this.Offest = offset;
    }
    GetID() {
        return this.id;
    }
    GetItems() {
        return this.Items;
    }
    GetLimit() {
        return this.Limit;
    }
    GetTotal() {
        return this.Total;
    }
    GetOffset() {
        return this.Offest;
    }
    static FromObject(response) {
        return new SpotifyAlbumResponse(response.id, response.Items, response.Limit, response.Total, response.Offest);
    }
    static fetchAlbumResponseHook(appPrefix, servicePrefix) {
        let commandHook = appPrefix + "." + servicePrefix + "." + SpotifyAlbumResponse.RESPONSE_HOOK;
        return commandHook;
    }
}
SpotifyAlbumResponse.RESPONSE_HOOK = "Album.Response";
exports.SpotifyAlbumResponse = SpotifyAlbumResponse;
