import * as logger from 'morgan';
import * as socketIo from "socket.io";
import * as amqp from 'amqplib/callback_api'
import { RabbitMQService } from './rabbit-mq';
import { QueueManagerService } from './queue-manager';

import { NowPlayingItem } from '../models/shared/now-playing/now-playing-item';

export class PlayerManagerService {
    public static readonly SERVICE_PREFIX: string = "PlayerManager";

    private appPrefix: string;

    private io: SocketIO.Server;
    private rabbit: RabbitMQService;
    private queueManager: QueueManagerService

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

        return this;
    }

    private config(): void {
        console.log('Player Manager Service Initiated!');
    }

    private logQueue(): void {

        console.log("Player Queue Display : ");
        console.log(this.queueManager.FetchQueue());

    }

}