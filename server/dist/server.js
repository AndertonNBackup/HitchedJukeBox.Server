"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const io = require("socket.io-client");
const redis = require("socket.io-redis");
const user_1 = require("./services/user");
class Server {
    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.services();
        this.listen();
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
        console.log("Redis Host : " + this.redisHost);
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
        this.socket = io.connect('localhost:8081', {
            upgrade: false,
            transports: ['websocket']
        });
        this.socket.on("Test", (val) => {
            console.log(val);
        });
    }
    services() {
        //this.spotify = SpotifyService.bootstrap();
        //this.nowPlaying = NowPlayingService.bootstrap();
    }
    listen() {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });
        this.io.of('/').adapter.on('connect', (socket) => {
            let connectedUserMap = user_1.UserFunctions.getMap();
            connectedUserMap.set(socket.id, { status: 'online', name: 'none' });
            console.log('Connected client on port %s.', this.port);
            console.log('Connected client id : %s.', socket.id);
            socket.on('recieveUserName', (data) => {
                let user = connectedUserMap.get(socket.id);
                user.name = data.name;
                console.log('Connected client name : %s.', user.name);
                this.spotify.register_hooks(this.io, socket, Server.APP_PREFIX);
                this.nowPlaying.register_hooks(this.io, socket, Server.APP_PREFIX);
            });
            socket.on('disconnect', () => {
                console.log('Client disconnected');
                let user = connectedUserMap.get(socket.id);
                user.status = 'offline';
            });
        });
        this.io.on('Test', (val) => {
            console.log(val);
        });
        this.io.emit("Test", "Test");
        this.io.on('connect', (socket) => {
            let connectedUserMap = user_1.UserFunctions.getMap();
            connectedUserMap.set(socket.id, { status: 'online', name: 'none' });
            console.log('Connected client on port %s.', this.port);
            console.log('Connected client id : %s.', socket.id);
            socket.on('recieveUserName', (data) => {
                let user = connectedUserMap.get(socket.id);
                user.name = data.name;
                console.log('Connected client name : %s.', user.name);
                this.spotify.register_hooks(this.io, socket, Server.APP_PREFIX);
                this.nowPlaying.register_hooks(this.io, socket, Server.APP_PREFIX);
            });
            socket.on('disconnect', () => {
                console.log('Client disconnected');
                let user = connectedUserMap.get(socket.id);
                user.status = 'offline';
            });
        });
    }
}
Server.REDIS_HOST = 'localhost';
Server.PORT = 8085;
Server.APP_PREFIX = 'HJBV';
const server = Server.bootstrap();
const app = server.app;
exports.default = app;
