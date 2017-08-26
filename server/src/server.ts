import * as express from "express";
import * as http from "http";
import * as socketIo from "socket.io";
import * as io from 'socket.io-client';
import * as redis from 'socket.io-redis';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as amqp from 'amqplib/callback_api'

import { NowPlayingService } from './services/now-playing';
import { RabbitMQService } from './services/rabbit-mq';
import { QueueManagerService } from './services/queue-manager';
import { PlayerManagerService } from './services/player-manager';

class Server {
    public static readonly REDIS_HOST = 'localhost';
    public static readonly PORT: number = 8085;
    public static readonly APP_PREFIX: string = 'HJBV';
    public app: any;
    private server: any;
    private io: SocketIO.Server;
    private nowPlaying: NowPlayingService;
    private rabbit: RabbitMQService;
    private queueManager: QueueManagerService;
    private playerManager: PlayerManagerService;
    private redisHost: string;
    private port: number;

    public static bootstrap(): Server {
        return new Server().bootstrap();
    }

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.services();
    }

    private bootstrap(): Server {

        return this;
    }

    private createApp(): void {
        this.app = express();
    }

    private createServer(): void {
        this.server = http.createServer(this.app);
    }

    private config(): void {
        this.port = parseInt(process.env.PORT) || Server.PORT;
        this.redisHost = process.env.REDIS_HOST || Server.REDIS_HOST;
    }

    private sockets(): void {
        try {
            this.io = socketIo(this.server);
            this.io.adapter(redis({ host: this.redisHost, port: 6379 }));

            this.io.of('/').adapter.on('error', function (error) { console.log(error) });
        }
        catch (e) {
            this.io = socketIo(this.server);
        }

    }

    private services(): void {
        this.rabbit = RabbitMQService.bootstrap();
        this.queueManager = QueueManagerService.bootstrap();
        this.nowPlaying = NowPlayingService.bootstrap(this.rabbit, this.io, this.queueManager);
        this.playerManager = PlayerManagerService.bootstrap(this.rabbit, this.io, this.queueManager);

    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

    }
}

const server = Server.bootstrap();
const app = server.app;
export default app;