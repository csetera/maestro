import AbstractBroadcaster from '@/shared/audio/AbstractBroadcaster';
import Broadcaster from '@/shared/audio/Broadcaster';
import IHeartRadio from '@/shared/broadcasters/IHeartRadio';
import Pandora from '@/shared/broadcasters/Pandora';
import SiriusXM from '@/shared/broadcasters/SiriusXM';
import Spotify from '@/shared/broadcasters/Spotify';
import TuneInRadio from '@/shared/broadcasters/TuneInRadio';
import YouTubeMusic from '@/shared/broadcasters/YouTubeMusic';

const ALL_BROADCASTERS = [
    new IHeartRadio(),
    new Pandora(),
    new SiriusXM(),
    new Spotify(),
    new TuneInRadio(),
    new YouTubeMusic(),
];

export class DummyBroadcaster extends AbstractBroadcaster {
    constructor() {
        super();

        this.id = 'dummy';
        this.name = 'Dummy';
    }
}

/**
 * Return the Broadcaster with the specified identifier
 * 
 * @param id 
 */
export function broadcasterWithId(id: string): Broadcaster|undefined {
    return ALL_BROADCASTERS.find((broadcaster) => {
        return !broadcaster.disabled && (broadcaster.id === id);
    });
}

/**
 * Return the Broadcaster with the specified name
 * 
 * @param name 
 */
export function broadcasterWithName(name: string): Broadcaster|undefined {
    return ALL_BROADCASTERS.find((broadcaster) => {
        return !broadcaster.disabled && (broadcaster.name === name);
    });
};

export default ALL_BROADCASTERS.filter((player) => !player.disabled);
