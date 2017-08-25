"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const redis = require("socket.io-redis");
const now_playing_1 = require("./services/now-playing");
const rabbit_mq_1 = require("./services/rabbit-mq");
class Server {
    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.services();
    }
    static bootstrap() {
        return new Server().bootstrap();
    }
    bootstrap() {
        return this;
    }
    createApp() {
        this.app = express();
    }
    createServer() {
        this.server = http.createServer(this.app);
    }
    config() {
        this.port = parseInt(process.env.PORT) || Server.PORT;
        this.redisHost = process.env.REDIS_HOST || Server.REDIS_HOST;
    }
    sockets() {
        try {
            this.io = socketIo(this.server);
            this.io.adapter(redis({ host: this.redisHost, port: 6379 }));
            this.io.of('/').adapter.on('error', function (error) { console.log(error); });
        }
        catch (e) {
            this.io = socketIo(this.server);
        }
    }
    services() {
        this.rabbit = rabbit_mq_1.RabbitMQService.bootstrap();
        this.nowPlaying = now_playing_1.NowPlayingService.bootstrap(this.rabbit, this.io);
    }
    listen() {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });
    }
}
Server.REDIS_HOST = 'localhost';
Server.PORT = 8085;
Server.APP_PREFIX = 'HJBV';
const server = Server.bootstrap();
const app = server.app;
exports.default = app;
