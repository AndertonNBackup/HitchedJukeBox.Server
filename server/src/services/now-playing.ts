import * as logger from 'morgan';
import * as socketIo from "socket.io";
import { Observable } from 'rxjs/Observable';
import { ISubscription } from "rxjs/Subscription";

import { UserFunctions } from './user';
import { RabbitMQService } from './rabbit-mq';
import { QueueManagerService } from './queue-manager';

import { SpotifyTrack } from '../models/shared/core/spotify-track';

import { NowPlayingRequest } from '../models/shared/now-playing/now-playing-request';
import { NowPlayingTrackRequest } from '../models/shared/now-playing/now-playing-track-request';
import { NowPlayingAlbumRequest } from '../models/shared/now-playing/now-playing-album-request';
import { NowPlayingCommandRequest } from '../models/shared/now-playing/now-playing-command-request';
import { NowPlayingResponse } from '../models/shared/now-playing/now-playing-response';

import { NowPlayingItem } from '../models/shared/now-playing/now-playing-item';

export class NowPlayingService {
    public static readonly SERVICE_PREFIX: string = "NowPlaying";

    private appPrefix: string = "HJB";

    private io: SocketIO.Server;
    private rabbit: RabbitMQService;
    private queueManager: QueueManagerService;
    private voterConnection: ISubscription;

    public static bootstrap(rabbit: RabbitMQService, io: SocketIO.Server, queueManager: QueueManagerService): NowPlayingService {
        return new NowPlayingService(rabbit, io, queueManager).bootstrap();
    }

    constructor(rabbit: RabbitMQService, io: SocketIO.Server, queueManager: QueueManagerService) {
        this.config();
        this.rabbit = rabbit;
        this.io = io;
        this.queueManager = queueManager
    }

    private bootstrap(): NowPlayingService {
        this.listen();
        return this;
    }

    private config(): void {
        console.log('Now Playing Service Initiated!');
    }

    private listen() {
        this.voterConnection = this.rabbit.getMessagesObervable(RabbitMQService.RS_VOTER_Q).subscribe((nowPlayingRequest): any => {

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

        let spotifyTrack: SpotifyTrack = SpotifyTrack.fromJSON(trackRequest);

        this.queueManager.AddTrack(
            new NowPlayingItem(
                NowPlayingItem.NP_TRACK,
                spotifyTrack.GetID(),
                spotifyTrack.GetName(),
                spotifyTrack.GetArtistName(),
                spotifyTrack.GetImage(),
                Credentials.name
            )
        );

        let nowPlayingResponse: NowPlayingResponse = new NowPlayingResponse(
            this.queueManager.FetchQueue()
        );

        this.io.emit(
            NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX),
            nowPlayingResponse
        );
    }

    private process_command_request(commandRequest: NowPlayingCommandRequest, Credentials: { status: string, name: string }): void {

        commandRequest = NowPlayingCommandRequest.FromObject(commandRequest);

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

        let nowPlayingResponse: NowPlayingResponse = new NowPlayingResponse(
            this.queueManager.FetchQueue()
        );

        this.io.emit(
            NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX),
            nowPlayingResponse
        );
    }

    private process_upvote_request(Credentials: { status: string, name: string }, commandRequest: NowPlayingCommandRequest): void {

        this.queueManager.AddVoteToTrack(commandRequest.GetIndex(), Credentials.name);

        let nowPlayingResponse: NowPlayingResponse = new NowPlayingResponse(
            this.queueManager.FetchQueue()
        );

        this.io.emit(
            NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX),
            nowPlayingResponse
        );
    }

    private process_downvote_request(Credentials: { status: string, name: string }, commandRequest: NowPlayingCommandRequest): void {

        this.queueManager.RemoveVoteFromTrack(commandRequest.GetIndex(), Credentials.name);

        let nowPlayingResponse: NowPlayingResponse = new NowPlayingResponse(
            this.queueManager.FetchQueue()
        );

        this.io.emit(
            NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX),
            nowPlayingResponse
        );
    }

    private process_clear_request(Credentials: { status: string, name: string }): void {

        let nowPlayingResponse: NowPlayingResponse = new NowPlayingResponse(
            this.queueManager.ClearQueue()
        );

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