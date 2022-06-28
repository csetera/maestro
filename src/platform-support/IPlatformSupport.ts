import MediaKeys from '@/shared/constants/MediaKeys';
import * as winston from 'winston';

export default interface IPlatformSupport {
    registerMediaKeyHandlers(logger: winston.Logger, callback: (mediaKey: MediaKeys) => void): Promise<void>;
}
