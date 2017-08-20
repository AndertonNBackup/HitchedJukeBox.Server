var express = require("express"),
  app = express();
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var http = require('http').Server(app);
var http = require('http').createServer(app);
//var io = require('socket.io')(http);
var redis = require('socket.io-redis');
var SpotifyWebApi = require('spotify-web-api-node');
var path = require('path');


var io = require('socket.io')(http, {
  serveClient: true,
  path: '/socket.io'
}).listen(http);

var spotifyApi = new SpotifyWebApi({
  clientId: '4658a83f5b35440398ea4f3590979658',
  clientSecret: 'f4c1782bf58446518647dd2c9a272bc2'
});

spotifyApi.clientCredentialsGrant()
  .then(function (data) {
    console.log('The access token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);

  }, function (err) {
    console.log('Something went wrong when retrieving an access token', err);
  });

io.on('connection', function (socket) {
  socket.on('HJBV_Search', function (request) {
    console.log("Recieved Request:");
    console.log(request);
    switch (request.type.id) {
      case 1:
        console.log("Album:");
        var search = spotifyApi.searchAlbums(request.search);
        break;
      case 2:
        console.log("Artist:");
        var search = spotifyApi.searchArtists(request.search);
        break;
      default:
        console.log("Song:");
        var search = spotifyApi.searchTracks(request.search);
        break;
    }
    search.then(function (data) {
      let container = data.body.tracks || data.body.artists || data.body.albums;
      let response = {
        type: request.type,
        booleans: {
          isAlbumSearch: data.body.albums ? true : false,
          isArtistSearch: data.body.artists ? true : false,
          isTrackSearch: data.body.tracks ? true : false
        },
        items: container.items,
        limit: container.limit,
        total: container.total,
        offset: container.offset,
      };
      io.emit('HJBV_SpotifySearchResponse', response);
      console.log("Responded");
    }, function (err) {
      console.error(err);
      if (err.statusCode == 401) {
        console.log("Reprocessing Token");
        spotifyApi.clientCredentialsGrant()
          .then(function (data) {
            console.log('The access token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);

            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body['access_token']);

            switch (request.type.id) {
              case 1:
                console.log("Album:");
                var search = spotifyApi.searchAlbums(request.search);
                break;
              case 2:
                console.log("Artist:");
                var search = spotifyApi.searchArtists(request.search);
                break;
              default:
                console.log("Song:");
                var search = spotifyApi.searchTracks(request.search);
                break;
            }

            search.then(function (data) {
              let container = data.body.tracks || data.body.artists || data.body.albums;
              let response = {
                type: request.type,
                booleans: {
                  isAlbumSearch: data.body.albums ? true : false,
                  isArtistSearch: data.body.artists ? true : false,
                  isTrackSearch: data.body.tracks ? true : false
                },
                items: container.items,
                limit: container.limit,
                total: container.total,
                offset: container.offset,
              };
              io.emit('HJBV_SpotifySearchResponse', response);
              console.log("Responded");
            }, function (err) {
              console.error("Stopping : " + err);
            });

          }, function (err) {
            console.log('Something went wrong when retrieving an access token', err);
          });

      }
    });
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});