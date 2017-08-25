import * as logger from 'morgan';

import { NowPlayingItem } from '../models/shared/now-playing/now-playing-item';
import { SpotifyTrack } from '../models/shared/core/spotify-track';

export class QueueManagerService {

    private MainQueue: Array<NowPlayingItem>;

    public static bootstrap(): QueueManagerService {
        return new QueueManagerService().bootstrap();
    }

    constructor() {
        this.config();
    }

    private bootstrap(): QueueManagerService {
        return this;
    }

    private config(): void {
        console.log('Queue Manager Service Initiated!');

        this.MainQueue = new Array<any>();
    }

    public AddTrack(track: NowPlayingItem): boolean
    {
        this.MainQueue.push(track);
        return true;
    }

    private remove_track(id: string): boolean
    {
        this.MainQueue = this.MainQueue.filter(item => item.getId() !== id);
        return true;
    }

    public AddVoteToTrack(id: string, user: string): boolean
    {
        let nowPlayingItem = this.fetch_item_by_id(id);
        nowPlayingItem.AddVote(user);
        return true;
    }

    public RemoveVoteFromTrack(id: string, user: string): boolean
    {
        let nowPlayingItem = this.fetch_item_by_id(id);
        nowPlayingItem.RemoveVote(user);

        if (nowPlayingItem.GetVoteCount() <= 0) {
            this.remove_track(id);
        }

        return true;
    }

    public FetchQueue(): Array<NowPlayingItem>
    {
        return this.sort_queue();
    }

    public ClearQueue(): Array<NowPlayingItem>
    {
        this.MainQueue = new Array<NowPlayingItem>();
        return this.MainQueue;
    }

    private fetch_item_by_id(id: string): NowPlayingItem
    {
        return this.MainQueue.find(item => item.getId() === id);
    }

    private sort_queue(): Array<NowPlayingItem>
    {
        this.MainQueue = this.MainQueue.sort((itemA, itemB) => {
            return itemA.GetVoteCount() > itemB.GetVoteCount() ? -1 : itemA.GetVoteCount() == itemB.GetVoteCount() ? 0 : 1;
        });

        return this.MainQueue;
    }    

}