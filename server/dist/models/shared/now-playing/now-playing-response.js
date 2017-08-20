"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NowPlayingResponse {
    constructor(queue) {
        this.queue = queue;
    }
    static FromObject(response) {
        return new NowPlayingResponse(response.queue);
    }
    static fetchNowPlayingResponseHook(appPrefix, servicePrefix) {
        let commandHook = appPrefix + "." + servicePrefix + "." + NowPlayingResponse.RESPONSE_HOOK;
        return commandHook;
    }
}
NowPlayingResponse.RESPONSE_HOOK = "NowPlaying.Response";
exports.NowPlayingResponse = NowPlayingResponse;
