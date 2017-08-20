"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SpotifyWebApi = require("spotify-web-api-node");
const user_1 = require("./user");
const spotify_request_1 = require("../models/shared/spotify/spotify-request");
const spotify_search_request_1 = require("../models/shared/spotify/spotify-search-request");
const spotify_search_response_1 = require("../models/shared/spotify/spotify-search-response");
const spotify_search_response_data_1 = require("../models/shared/spotify/spotify-search-response-data");
const spotify_track_request_1 = require("../models/shared/spotify/spotify-track-request");
const spotify_track_response_1 = require("../models/shared/spotify/spotify-track-response");
const spotify_track_response_data_1 = require("../models/shared/spotify/spotify-track-response-data");
const spotify_album_request_1 = require("../models/shared/spotify/spotify-album-request");
const spotify_album_response_1 = require("../models/shared/spotify/spotify-album-response");
const spotify_album_response_data_1 = require("../models/shared/spotify/spotify-album-response-data");
class SpotifyService {
    constructor() {
        this.config();
    }
    static bootstrap() {
        return new SpotifyService().bootstrap();
    }
    bootstrap() {
        this.setup_key();
        return this;
    }
    config() {
        console.log('Spotify Service Initiated!');
        this.spotify = new SpotifyWebApi({
            clientId: '4658a83f5b35440398ea4f3590979658',
            clientSecret: 'f4c1782bf58446518647dd2c9a272bc2'
        });
    }
    setup_key() {
        this.spotify.clientCredentialsGrant()
            .then((data) => {
            // Save the access token so that it's used in future calls
            this.spotify.setAccessToken(data.body['access_token']);
            let expiry = parseInt(data.body['expires_in']) - 10;
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.setup_key();
            }, expiry * 1000);
            console.log('Your  access token is ' + data.body['access_token']);
        }, (err) => {
            console.log('Something went wrong when retrieving an access token: ', err);
        });
    }
    register_hooks(io, socket, appPrefix) {
        this.io = io;
        this.appPrefix = appPrefix;
        socket.on(spotify_request_1.SpotifyRequest.fetchCommandHook(appPrefix, SpotifyService.SERVICE_PREFIX), (spotifyRequest) => {
            let user = user_1.UserFunctions.getUser(socket.id);
            console.log('Processing Request for client name : %s.', user.name);
            console.log('Total Users Is : %s.', user_1.UserFunctions.getOnlineUserCount());
            console.log('User Key By Name Is : %s.', user_1.UserFunctions.getSocketIdForUserName(user.name));
            spotifyRequest = spotify_request_1.SpotifyRequest.FromObject(spotifyRequest);
            switch (spotifyRequest.GetType()) {
                case spotify_request_1.SpotifyRequest.SEARCH:
                    this.handle_search(socket, spotifyRequest.GetValue());
                    break;
                case spotify_request_1.SpotifyRequest.FETCH_TRACKS:
                    this.handle_track_request(socket, spotifyRequest.GetValue());
                    break;
                case spotify_request_1.SpotifyRequest.FETCH_ALBUMS:
                    this.handle_album_request(socket, spotifyRequest.GetValue());
                    break;
                default:
            }
        });
    }
    handle_search(socket, searchRequest) {
        searchRequest = spotify_search_request_1.SpotifySearchRequest.FromObject(searchRequest);
        let searchObject;
        switch (searchRequest.GetType()) {
            case spotify_search_request_1.SpotifySearchRequest.ST_ALBUM:
                searchObject = this.spotify.searchAlbums(searchRequest.GetSearchValue());
                break;
            case spotify_search_request_1.SpotifySearchRequest.ST_ARTIST:
                searchObject = this.spotify.searchArtists(searchRequest.GetSearchValue());
                break;
            case spotify_search_request_1.SpotifySearchRequest.ST_SONG:
            default:
                searchObject = this.spotify.searchTracks(searchRequest.GetSearchValue());
        }
        searchObject.then((data) => {
            let searchData = new spotify_search_response_data_1.SpotifySearchResponseData().loadFromData(data);
            socket.emit(spotify_search_response_1.SpotifySearchResponse.fetchSearchResponseHook(this.appPrefix, SpotifyService.SERVICE_PREFIX), new spotify_search_response_1.SpotifySearchResponse(searchRequest.GetType(), searchData.GetItems(), searchData.GetLimit(), searchData.GetTotal(), searchData.GetOffset()));
        }, (err) => {
            if (err.statusCode == 401) {
                this.setup_key();
                this.handle_search(socket, searchRequest);
            }
        });
    }
    handle_track_request(socket, trackRequest) {
        trackRequest = spotify_track_request_1.SpotifyTrackRequest.FromObject(trackRequest);
        let searchObject = this.spotify.getAlbumTracks(trackRequest.GetAlbumID());
        searchObject.then((data) => {
            let trackData = new spotify_track_response_data_1.SpotifyTrackResponseData().loadFromData(data);
            socket.emit(spotify_track_response_1.SpotifyTrackResponse.fetchTrackResponseHook(this.appPrefix, SpotifyService.SERVICE_PREFIX), new spotify_track_response_1.SpotifyTrackResponse(trackRequest.GetAlbumID(), trackData.GetItems(), trackData.GetLimit(), trackData.GetTotal(), trackData.GetOffset()));
        }, (err) => {
            console.log(err);
        });
    }
    handle_album_request(socket, albumRequest) {
        albumRequest = spotify_album_request_1.SpotifyAlbumRequest.FromObject(albumRequest);
        let searchObject = this.spotify.getArtistAlbums(albumRequest.GetArtistID());
        searchObject.then((data) => {
            let albumData = new spotify_album_response_data_1.SpotifyAlbumResponseData().loadFromData(data);
            socket.emit(spotify_album_response_1.SpotifyAlbumResponse.fetchAlbumResponseHook(this.appPrefix, SpotifyService.SERVICE_PREFIX), new spotify_album_response_1.SpotifyAlbumResponse(albumRequest.GetArtistID(), albumData.GetItems(), albumData.GetLimit(), albumData.GetTotal(), albumData.GetOffset()));
        }, (err) => {
            console.log(err);
        });
    }
}
SpotifyService.SERVICE_PREFIX = "Spotify";
exports.SpotifyService = SpotifyService;
