"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let connectedUserMap = new Map();
class UserFunctions {
    static getMap() {
        return UserFunctions.UserMap;
    }
    static getUser(socketID) {
        return UserFunctions.UserMap.get(socketID);
    }
    static getSocketIdForUserName(userName) {
        let socketID = '';
        UserFunctions.UserMap.forEach((user, key, map) => {
            if (user.name === userName) {
                socketID = key;
            }
        });
        return socketID;
    }
    static getOnlineUserCount() {
        let onlineUsers = 0;
        UserFunctions.UserMap.forEach((user, key, map) => {
            if (user.status === 'online') {
                onlineUsers++;
            }
        });
        return onlineUsers;
    }
}
UserFunctions.UserMap = connectedUserMap;
exports.UserFunctions = UserFunctions;
