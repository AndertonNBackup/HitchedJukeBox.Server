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
    AddCredentials(Credentials) {
        this.Credentials = Credentials;
        return true;
    }
    GetCredentials() {
        return this.Credentials;
    }
    static FromObject(request) {
        let npr = new NowPlayingRequest(request.Type, request.Data);
        npr.AddCredentials(request.Credentials);
        return npr;
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
