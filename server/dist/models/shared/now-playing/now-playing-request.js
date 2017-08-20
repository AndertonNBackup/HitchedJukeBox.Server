"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NowPlayingRequest {
    constructor(type, data) {
        this.Type = type;
        this.Data = data;
    }
    GetType() {
        return this.Type;
    }
    GetData() {
        return this.Data;
    }
    static FromObject(request) {
        return new NowPlayingRequest(request.Type, request.Data);
    }
    static fetchCommandHook(appPrefix, servicePrefix) {
        let commandHook = appPrefix + "." + servicePrefix + "." + NowPlayingRequest.COMMAND_HOOK;
        return commandHook;
    }
}
NowPlayingRequest.NP_REQUEST_TRACK = 0;
NowPlayingRequest.NP_REQUEST_ALBUM = 1;
NowPlayingRequest.NP_REQUEST_COMMAND = 2;
NowPlayingRequest.COMMAND_HOOK = "NowPlaying.Request";
exports.NowPlayingRequest = NowPlayingRequest;
