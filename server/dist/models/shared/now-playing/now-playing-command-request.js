"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NowPlayingCommandRequest {
    constructor(type, index) {
        this.Type = type;
        this.Index = index ? index : "";
    }
    GetType() {
        return this.Type;
    }
    GetIndex() {
        return this.Index;
    }
    static FromObject(request) {
        return new NowPlayingCommandRequest(request.Type, request.Index);
    }
}
NowPlayingCommandRequest.NPC_REFRESH = 1;
NowPlayingCommandRequest.NPC_VOTE = 2;
NowPlayingCommandRequest.NPC_DOWNVOTE = 3;
NowPlayingCommandRequest.NPC_CLEAR = 4;
exports.NowPlayingCommandRequest = NowPlayingCommandRequest;
