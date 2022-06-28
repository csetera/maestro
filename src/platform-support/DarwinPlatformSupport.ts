import IPlatformSupport from '@/platform-support/IPlatformSupport';
import MediaKeys from '@/shared/constants/MediaKeys';
import * as winston from 'winston';

class DarwinPlatformSupport implements IPlatformSupport {
    registerMediaKeyHandlers(logger: winston.Logger, callback: (mediaKey: MediaKeys) => void): Promise<void> {
        return Promise.resolve();
    }
}

const darwinSupport = new DarwinPlatformSupport();
export default darwinSupport;
