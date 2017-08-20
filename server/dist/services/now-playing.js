"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("./user");
const spotify_track_1 = require("../models/shared/core/spotify-track");
const now_playing_request_1 = require("../models/shared/now-playing/now-playing-request");
const now_playing_track_request_1 = require("../models/shared/now-playing/now-playing-track-request");
const now_playing_command_request_1 = require("../models/shared/now-playing/now-playing-command-request");
const now_playing_response_1 = require("../models/shared/now-playing/now-playing-response");
const now_playing_item_1 = require("../models/shared/now-playing/now-playing-item");
class NowPlayingService {
    constructor() {
        this.config();
    }
    static bootstrap() {
        return new NowPlayingService().bootstrap();
    }
    bootstrap() {
        return this;
    }
    config() {
        console.log('Now Playing Service Initiated!');
        this.MainQueue = new Array();
    }
    register_hooks(io, socket, appPrefix) {
        this.io = io;
        this.appPrefix = appPrefix;
        socket.on(now_playing_request_1.NowPlayingRequest.fetchCommandHook(appPrefix, NowPlayingService.SERVICE_PREFIX), (nowPlayingRequest) => {
            let user = user_1.UserFunctions.getUser(socket.id);
            nowPlayingRequest = now_playing_request_1.NowPlayingRequest.FromObject(nowPlayingRequest);
            switch (nowPlayingRequest.GetType()) {
                case now_playing_request_1.NowPlayingRequest.NP_REQUEST_ALBUM:
                    this.process_album_request(socket, nowPlayingRequest.GetData());
                    break;
                case now_playing_request_1.NowPlayingRequest.NP_REQUEST_TRACK:
                    this.process_track_request(socket, nowPlayingRequest.GetData());
                    break;
                case now_playing_request_1.NowPlayingRequest.NP_REQUEST_COMMAND:
                    this.process_command_request(socket, nowPlayingRequest.GetData());
                    break;
                default:
            }
        });
    }
    process_track_request(socket, trackRequest) {
        trackRequest = now_playing_track_request_1.NowPlayingTrackRequest.FromObject(trackRequest);
        let spotifyTrack = spotify_track_1.SpotifyTrack.fromJSON(trackRequest);
        let user = user_1.UserFunctions.getUser(socket.id);
        this.MainQueue.push(new now_playing_item_1.NowPlayingItem(now_playing_item_1.NowPlayingItem.NP_TRACK, spotifyTrack.GetID(), spotifyTrack.GetName(), spotifyTrack.GetArtistName(), spotifyTrack.GetImage(), user.name));
        let nowPlayingResponse = new now_playing_response_1.NowPlayingResponse(this.MainQueue);
        socket.emit(now_playing_response_1.NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX), nowPlayingResponse);
        socket.broadcast.emit(now_playing_response_1.NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX), nowPlayingResponse);
    }
    process_command_request(socket, commandRequest) {
        commandRequest = now_playing_command_request_1.NowPlayingCommandRequest.FromObject(commandRequest);
        console.log(commandRequest);
        switch (commandRequest.GetType()) {
            case now_playing_command_request_1.NowPlayingCommandRequest.NPC_REFRESH:
                this.process_reresh_request(socket);
                break;
            case now_playing_command_request_1.NowPlayingCommandRequest.NPC_CLEAR:
                this.process_clear_request(socket);
                break;
            case now_playing_command_request_1.NowPlayingCommandRequest.NPC_VOTE:
                this.process_upvote_request(socket, commandRequest);
                break;
            case now_playing_command_request_1.NowPlayingCommandRequest.NPC_DOWNVOTE:
                this.process_downvote_request(socket, commandRequest);
                break;
            default:
        }
    }
    process_reresh_request(socket) {
        let nowPlayingResponse = new now_playing_response_1.NowPlayingResponse(this.MainQueue);
        socket.emit(now_playing_response_1.NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX), nowPlayingResponse);
    }
    process_upvote_request(socket, commandRequest) {
        let nowPlayingItem = this.MainQueue.find(item => item.getId() === commandRequest.GetIndex());
        let user = user_1.UserFunctions.getUser(socket.id);
        nowPlayingItem.AddVote(user.name);
        this.MainQueue = this.MainQueue.sort((itemA, itemB) => {
            return itemA.GetVoteCount() > itemB.GetVoteCount() ? -1 : itemA.GetVoteCount() == itemB.GetVoteCount() ? 0 : 1;
        });
        let nowPlayingResponse = new now_playing_response_1.NowPlayingResponse(this.MainQueue);
        socket.emit(now_playing_response_1.NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX), nowPlayingResponse);
        socket.broadcast.emit(now_playing_response_1.NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX), nowPlayingResponse);
    }
    process_downvote_request(socket, commandRequest) {
        let nowPlayingItem = this.MainQueue.find(item => item.getId() === commandRequest.GetIndex());
        let user = user_1.UserFunctions.getUser(socket.id);
        nowPlayingItem.RemoveVote(user.name);
        if (nowPlayingItem.GetVoteCount() <= 0) {
            this.MainQueue = this.MainQueue.filter(item => item.getId() !== nowPlayingItem.getId());
        }
        this.MainQueue = this.MainQueue.sort((itemA, itemB) => {
            return itemA.GetVoteCount() > itemB.GetVoteCount() ? -1 : itemA.GetVoteCount() == itemB.GetVoteCount() ? 0 : 1;
        });
        let nowPlayingResponse = new now_playing_response_1.NowPlayingResponse(this.MainQueue);
        socket.emit(now_playing_response_1.NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX), nowPlayingResponse);
        socket.broadcast.emit(now_playing_response_1.NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX), nowPlayingResponse);
    }
    process_clear_request(socket) {
        this.MainQueue = new Array();
        let nowPlayingResponse = new now_playing_response_1.NowPlayingResponse(this.MainQueue);
        socket.emit(now_playing_response_1.NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX), nowPlayingResponse);
        socket.broadcast.emit(now_playing_response_1.NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX), nowPlayingResponse);
    }
    process_album_request(socket, albumRequest) {
        // albumRequest = NowPlayingAlbumRequest.FromObject(albumRequest);
        // this.MainQueue.push({ 'id': "NewAlbumItem" });
        // let nowPlayingResponse: NowPlayingResponse = new NowPlayingResponse(this.MainQueue);
        // console.log("Emitting Event");
        // socket.emit(
        //     NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX),
        //     new NowPlayingResponse(this.MainQueue)
        // );
    }
}
NowPlayingService.SERVICE_PREFIX = "NowPlaying";
exports.NowPlayingService = NowPlayingService;
