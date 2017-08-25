import * as logger from 'morgan';
import * as socketIo from "socket.io";
import { Observable } from 'rxjs/Observable';
import { ISubscription } from "rxjs/Subscription";

import { UserFunctions } from './user';
import { RabbitMQService } from './rabbit-mq';

import { SpotifyTrack } from '../models/shared/core/spotify-track';

import { NowPlayingRequest } from '../models/shared/now-playing/now-playing-request';
import { NowPlayingTrackRequest } from '../models/shared/now-playing/now-playing-track-request';
import { NowPlayingAlbumRequest } from '../models/shared/now-playing/now-playing-album-request';
import { NowPlayingCommandRequest } from '../models/shared/now-playing/now-playing-command-request';
import { NowPlayingResponse } from '../models/shared/now-playing/now-playing-response';

import { NowPlayingItem } from '../models/shared/now-playing/now-playing-item';

export class NowPlayingService {
    public static readonly SERVICE_PREFIX: string = "NowPlaying";

    private appPrefix: string = "HJBV";

    private io: SocketIO.Server;
    private rabbit: RabbitMQService;
    private connection: ISubscription;

    private MainQueue: Array<NowPlayingItem>;

    public static bootstrap(rabbit: RabbitMQService, io: SocketIO.Server): NowPlayingService {
        return new NowPlayingService(rabbit, io).bootstrap();
    }

    constructor(rabbit: RabbitMQService, io: SocketIO.Server) {
        this.config();
        this.rabbit = rabbit;
        this.io = io;
    }

    private bootstrap(): NowPlayingService {
        this.listen();
        return this;
    }

    private config(): void {
        console.log('Now Playing Service Initiated!');

        this.MainQueue = new Array<any>();
    }

    private listen() {
        this.connection = this.rabbit.getMessages().subscribe((nowPlayingRequest): any => {

            nowPlayingRequest = NowPlayingRequest.FromObject(JSON.parse(nowPlayingRequest));

            switch (nowPlayingRequest.GetType()) {
                case NowPlayingRequest.NP_REQUEST_ALBUM:
                    // this.process_album_request(nowPlayingRequest.GetData() as NowPlayingAlbumRequest, nowPlayingRequest.GetCredentials());
                    break;
                case NowPlayingRequest.NP_REQUEST_TRACK:
                    this.process_track_request(nowPlayingRequest.GetData() as NowPlayingTrackRequest, nowPlayingRequest.GetCredentials());
                    break;
                case NowPlayingRequest.NP_REQUEST_COMMAND:
                    this.process_command_request(nowPlayingRequest.GetData() as NowPlayingCommandRequest, nowPlayingRequest.GetCredentials());
                    break;
                default:
            }
        });
    }

    private process_track_request(trackRequest: NowPlayingTrackRequest, Credentials: { status: string, name: string }): void {
        trackRequest = NowPlayingTrackRequest.FromObject(trackRequest);
        let spotifyTrack: SpotifyTrack = SpotifyTrack.fromJSON(trackRequest);

        this.MainQueue.push(new NowPlayingItem(
            NowPlayingItem.NP_TRACK,
            spotifyTrack.GetID(),
            spotifyTrack.GetName(),
            spotifyTrack.GetArtistName(),
            spotifyTrack.GetImage(),
            Credentials.name
        ));
        let nowPlayingResponse: NowPlayingResponse = new NowPlayingResponse(this.MainQueue);

        this.io.emit(
            NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX),
            nowPlayingResponse
        );
    }

    private process_command_request(commandRequest: NowPlayingCommandRequest, Credentials: { status: string, name: string }): void {
        commandRequest = NowPlayingCommandRequest.FromObject(commandRequest);
        console.log(commandRequest);
        switch (commandRequest.GetType()) {
            case NowPlayingCommandRequest.NPC_REFRESH:
                this.process_reresh_request(Credentials);
                break;
            case NowPlayingCommandRequest.NPC_CLEAR:
                this.process_clear_request(Credentials);
                break;
            case NowPlayingCommandRequest.NPC_VOTE:
                this.process_upvote_request(Credentials, commandRequest);
                break;
            case NowPlayingCommandRequest.NPC_DOWNVOTE:
                this.process_downvote_request(Credentials, commandRequest);
                break;
            default:
        }
    }

    private process_reresh_request(Credentials: { status: string, name: string }): void {
        let nowPlayingResponse: NowPlayingResponse = new NowPlayingResponse(this.MainQueue);
        this.io.emit(
            NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX),
            nowPlayingResponse
        );
    }

    private process_upvote_request(Credentials: { status: string, name: string }, commandRequest: NowPlayingCommandRequest): void {
        let nowPlayingItem: NowPlayingItem = this.MainQueue.find(item => item.getId() === commandRequest.GetIndex());
        nowPlayingItem.AddVote(Credentials.name);
        this.MainQueue = this.MainQueue.sort((itemA, itemB) => {
            return itemA.GetVoteCount() > itemB.GetVoteCount() ? -1 : itemA.GetVoteCount() == itemB.GetVoteCount() ? 0 : 1;
        });
        let nowPlayingResponse: NowPlayingResponse = new NowPlayingResponse(this.MainQueue);
        this.io.emit(
            NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX),
            nowPlayingResponse
        );
    }

    private process_downvote_request(Credentials: { status: string, name: string }, commandRequest: NowPlayingCommandRequest): void {
        let nowPlayingItem: NowPlayingItem = this.MainQueue.find(item => item.getId() === commandRequest.GetIndex());
        nowPlayingItem.RemoveVote(Credentials.name);
        if (nowPlayingItem.GetVoteCount() <= 0) {
            this.MainQueue = this.MainQueue.filter(item => item.getId() !== nowPlayingItem.getId());
        }
        this.MainQueue = this.MainQueue.sort((itemA, itemB) => {
            return itemA.GetVoteCount() > itemB.GetVoteCount() ? -1 : itemA.GetVoteCount() == itemB.GetVoteCount() ? 0 : 1
        });
        let nowPlayingResponse: NowPlayingResponse = new NowPlayingResponse(this.MainQueue);
        this.io.emit(
            NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX),
            nowPlayingResponse
        );
    }

    private process_clear_request(Credentials: { status: string, name: string }): void {
        this.MainQueue = new Array<any>();
        let nowPlayingResponse: NowPlayingResponse = new NowPlayingResponse(this.MainQueue);
        this.io.emit(
            NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX),
            nowPlayingResponse
        );
    }

    private process_album_request(socket: SocketIO.Socket, albumRequest: NowPlayingAlbumRequest): void {
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