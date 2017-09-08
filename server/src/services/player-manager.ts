import * as logger from 'morgan';
import * as socketIo from "socket.io";
import * as amqp from 'amqplib/callback_api';
import * as fetch from 'node-fetch';

import { Observable } from 'rxjs/Observable';
import { ISubscription } from "rxjs/Subscription";

import { RabbitMQService } from './rabbit-mq';
import { QueueManagerService } from './queue-manager';
import { QueueManagerRequest } from '../models/shared/queue-manager/queue-manager-request';
import { QueueManagerTrackRequest } from '../models/shared/queue-manager/queue-manager-track-request';

import { NowPlayingService } from './now-playing';
import { NowPlayingItem } from '../models/shared/now-playing/now-playing-item';
import { NowPlayingResponse } from '../models/shared/now-playing/now-playing-response';

export class PlayerManagerService {
    public static readonly SERVICE_PREFIX: string = "PlayerManager";

    private appPrefix: string = "HJB";

    private io: SocketIO.Server;
    private rabbit: RabbitMQService;
    private queueManager: QueueManagerService
    private playerConnection: ISubscription;

    private AccessTokem: string;
    private RefreshToken: string;

    public static bootstrap(
        rabbit: RabbitMQService, 
        io: SocketIO.Server,
        queueManager: QueueManagerService
    ): PlayerManagerService {
        return new PlayerManagerService(rabbit, io, queueManager).bootstrap();
    }

    constructor(
        rabbit: RabbitMQService, 
        io: SocketIO.Server,
        queueManager: QueueManagerService
    ) {
        this.rabbit = rabbit;
        this.io = io;
        this.queueManager = queueManager;

        this.config();
    }

    private bootstrap(): PlayerManagerService {

        // setInterval(() => { 
        //     this.logQueue(); 
        // }, 1000 * 30);

        this.listen();

        return this;
    }

    private config(): void {
        console.log('Player Manager Service Initiated!');
    }

    private listen() {
        this.playerConnection = this.rabbit.getMessagesObervable(RabbitMQService.RS_PLAYER_Q).subscribe((qmRequest: any): void => {

            qmRequest = QueueManagerRequest.FromObject(JSON.parse(qmRequest));
            let trackRequest = QueueManagerTrackRequest.FromObject(qmRequest.GetData() as QueueManagerTrackRequest);

            this.AccessTokem = trackRequest.GetAccessToken();
            this.RefreshToken = trackRequest.GetAccessToken();

            console.log("Track Request Recieved.");
            console.log("Access Token : " + this.AccessTokem);
            console.log("Refresh Token : " + this.RefreshToken);

            if(this.queueManager.FetchItemCount() > 0 ) {
                console.log("Sending Play Command!");
                let nowPlayingItem = this.queueManager.FetchItem();
                let uri: string = "spotify:track:" + nowPlayingItem.getId();
                console.log("Uri:");
                console.log(uri);
                this.sendGeneric('https://api.spotify.com/v1/me/player/play', {
                    "uris": [
                        uri
                    ]
                }).then(response => {
                    console.log(response);
                    let nowPlayingResponse: NowPlayingResponse = new NowPlayingResponse(
                        this.queueManager.FetchQueue()
                    );
                    this.io.emit(
                        NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX),
                        nowPlayingResponse
                    );
                });
            }

            // if(this.queueManager.FetchItemCount() > 0 ) {
            //     this.rabbit.sendMessage(
            //         RabbitMQService.RS_PLAYLIST_Q, 
            //         this.queueManager.FetchItem()
            //     );
            //     let nowPlayingResponse: NowPlayingResponse = new NowPlayingResponse(
            //         this.queueManager.FetchQueue()
            //     );
            //     this.io.emit(
            //         NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX),
            //         nowPlayingResponse
            //     );
            // } else {
            //     this.rabbit.sendMessage(
            //         RabbitMQService.RS_PLAYLIST_Q, 
            //         new NowPlayingItem(-1, "", "", "", "", "")
            //     );
            // }
            
        });
    }

    private sendGeneric(url: string, body: any, method: string = 'put'): Promise<any> {
        return fetch(url, {
            method: method,
            headers: { Authorization: 'Bearer ' + this.AccessTokem },
            body: JSON.stringify(body)
        });
    }

    private logQueue(): void {

        console.log("Player Queue Display : ");
        console.log(this.queueManager.FetchQueue());

    }

}