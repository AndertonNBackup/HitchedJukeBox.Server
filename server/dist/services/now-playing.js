"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spotify_track_1 = require("../models/shared/core/spotify-track");
const now_playing_request_1 = require("../models/shared/now-playing/now-playing-request");
const now_playing_track_request_1 = require("../models/shared/now-playing/now-playing-track-request");
const now_playing_response_1 = require("../models/shared/now-playing/now-playing-response");
const now_playing_item_1 = require("../models/shared/now-playing/now-playing-item");
class NowPlayingService {
    constructor(rabbit, io) {
        this.appPrefix = "HJBV";
        this.config();
        this.rabbit = rabbit;
        this.io = io;
    }
    static bootstrap(rabbit, io) {
        return new NowPlayingService(rabbit, io).bootstrap();
    }
    bootstrap() {
        this.listen();
        return this;
    }
    config() {
        console.log('Now Playing Service Initiated!');
        this.MainQueue = new Array();
    }
    listen() {
        this.connection = this.rabbit.getMessages().subscribe((nowPlayingRequest) => {
            nowPlayingRequest = now_playing_request_1.NowPlayingRequest.FromObject(JSON.parse(nowPlayingRequest));
            switch (nowPlayingRequest.GetType()) {
                // case NowPlayingRequest.NP_REQUEST_ALBUM:
                //     this.process_album_request(nowPlayingRequest.GetData() as NowPlayingAlbumRequest);
                //     break;
                case now_playing_request_1.NowPlayingRequest.NP_REQUEST_TRACK:
                    this.process_track_request(nowPlayingRequest.GetData(), nowPlayingRequest.GetCredentials());
                    break;
                // case NowPlayingRequest.NP_REQUEST_COMMAND:
                //     this.process_command_request(nowPlayingRequest.GetData() as NowPlayingCommandRequest);
                //     break;
                default:
            }
        });
    }
    process_track_request(trackRequest, Credentials) {
        trackRequest = now_playing_track_request_1.NowPlayingTrackRequest.FromObject(trackRequest);
        let spotifyTrack = spotify_track_1.SpotifyTrack.fromJSON(trackRequest);
        this.MainQueue.push(new now_playing_item_1.NowPlayingItem(now_playing_item_1.NowPlayingItem.NP_TRACK, spotifyTrack.GetID(), spotifyTrack.GetName(), spotifyTrack.GetArtistName(), spotifyTrack.GetImage(), Credentials.name));
        let nowPlayingResponse = new now_playing_response_1.NowPlayingResponse(this.MainQueue);
        this.io.emit(now_playing_response_1.NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX), nowPlayingResponse);
    }
}
NowPlayingService.SERVICE_PREFIX = "NowPlaying";
exports.NowPlayingService = NowPlayingService;
