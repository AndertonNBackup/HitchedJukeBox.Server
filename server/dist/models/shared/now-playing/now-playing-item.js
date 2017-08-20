"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NowPlayingItem {
    constructor(type, id, name, artistName, imageUrl, userName, votes, played) {
        this.Type = type;
        this.Id = id;
        this.Name = name;
        this.ArtistName = artistName;
        this.ImageUrl = imageUrl;
        this.UserName = userName;
        this.Played = played ? played : false;
        this.Votes = votes ? votes : new Array();
        if (!votes) {
            this.AddVote(userName);
        }
    }
    getName() {
        return this.Name;
    }
    getArtistName() {
        return this.ArtistName;
    }
    getType() {
        return this.Type;
    }
    getId() {
        return this.Id;
    }
    getImage() {
        return this.ImageUrl;
    }
    getUser() {
        return this.UserName;
    }
    AddVote(userName) {
        this.Votes.push(userName);
        return true;
    }
    RemoveVote(username) {
        this.Votes = this.Votes.filter(userName => userName != username);
        return true;
    }
    GetVotes() {
        return this.Votes;
    }
    GetVoteCount() {
        return this.Votes.length;
    }
    VotedFor(user) {
        let votedFor = false;
        try {
            if (this.Votes.find(userName => userName === user).length > 0) {
                votedFor = true;
            }
        }
        catch (e) {
        }
        return votedFor;
    }
    isPlayed() {
        return this.Played;
    }
    static FromObject(request) {
        return new NowPlayingItem(request.Type, request.Id, request.Name, request.ArtistName, request.ImageUrl, request.UserName, request.Votes, request.Played);
    }
}
NowPlayingItem.NP_TRACK = 1;
NowPlayingItem.NP_ALBUM = 1;
exports.NowPlayingItem = NowPlayingItem;
