import * as logger from 'morgan';
import * as socketIo from "socket.io";
import * as amqp from 'amqplib/callback_api'

import { Observable } from 'rxjs/Observable';
import { ISubscription } from "rxjs/Subscription";

import { RabbitMQService } from './rabbit-mq';
import { QueueManagerService } from './queue-manager';

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
        this.playerConnection = this.rabbit.getMessagesObervable(RabbitMQService.RS_PLAYER_Q).subscribe((result): any => {

            if(this.queueManager.FetchItemCount() > 0 ) {
                this.rabbit.sendMessage(
                    RabbitMQService.RS_PLAYLIST_Q, 
                    this.queueManager.FetchItem()
                );
                let nowPlayingResponse: NowPlayingResponse = new NowPlayingResponse(
                    this.queueManager.FetchQueue()
                );
                this.io.emit(
                    NowPlayingResponse.fetchNowPlayingResponseHook(this.appPrefix, NowPlayingService.SERVICE_PREFIX),
                    nowPlayingResponse
                );
            } else {
                // this.rabbit.sendMessage(
                //     RabbitMQService.RS_PLAYLIST_Q, 
                //     new NowPlayingItem(-1, "", "", "", "", "")
                // );
            }
            
        });
    }

    private logQueue(): void {

        console.log("Player Queue Display : ");
        console.log(this.queueManager.FetchQueue());

    }

}