import IPlatformSupport from '@/platform-support/IPlatformSupport';
import MediaKeys from '@/shared/constants/MediaKeys';
import * as winston from 'winston';

class Win32PlatformSupport implements IPlatformSupport {
    registerMediaKeyHandlers(logger: winston.Logger, callback: (mediaKey: MediaKeys) => void): Promise<void> {
        return Promise.resolve();
    }
}

const win32Support = new Win32PlatformSupport();
export default win32Support;
