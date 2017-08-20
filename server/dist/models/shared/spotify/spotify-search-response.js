"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SpotifySearchResponse {
    constructor(type, items, limit, total, offset) {
        this.Type = type;
        this.Items = items;
        this.Limit = limit;
        this.Total = total;
        this.Offest = offset;
    }
    GetType() {
        return this.Type;
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
        return new SpotifySearchResponse(response.Type, response.Items, response.Limit, response.Total, response.Offest);
    }
    static fetchSearchResponseHook(appPrefix, servicePrefix) {
        let commandHook = appPrefix + "." + servicePrefix + "." + SpotifySearchResponse.RESPONSE_HOOK;
        return commandHook;
    }
}
SpotifySearchResponse.RESPONSE_HOOK = "Spotify.Search.Response";
exports.SpotifySearchResponse = SpotifySearchResponse;
