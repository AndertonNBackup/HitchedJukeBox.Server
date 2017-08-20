"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SpotifyTrackResponse {
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
        return new SpotifyTrackResponse(response.id, response.Items, response.Limit, response.Total, response.Offest);
    }
    static fetchTrackResponseHook(appPrefix, servicePrefix) {
        let commandHook = appPrefix + "." + servicePrefix + "." + SpotifyTrackResponse.RESPONSE_HOOK;
        return commandHook;
    }
}
SpotifyTrackResponse.RESPONSE_HOOK = "Track.Response";
exports.SpotifyTrackResponse = SpotifyTrackResponse;
