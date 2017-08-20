"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NowPlayingTrackRequest {
    constructor(track) {
        this.Track = track;
    }
    GetTrack() {
        return this.Track;
    }
    static FromObject(request) {
        return new NowPlayingTrackRequest(request.Track);
    }
}
exports.NowPlayingTrackRequest = NowPlayingTrackRequest;
