import dbus from 'dbus-next';
import MediaKeys from '@/shared/constants/MediaKeys';
import mpris from 'mpris-service';
import { app } from 'electron';
import * as winston from 'winston';

const player = mpris({
    name: 'maestro',
    identity: 'Maestro',
    canRaise: false,
    supportedUriSchemes: [ 'http', 'https' ],
    supportedMimeTypes: [ 'audio/*' ],
    supportedInterfaces: [ 'player' ],
    desktopEntry: 'maestro',
});

/**
 * Register DBus event handlers for legacy Gnome-based platforms.
 *
 * @param logger
 * @param callback
 */
async function registerDbusMediaKeyHandler(logger: winston.Logger, callback: (mediaKey: MediaKeys) => void) {
    logger.info("Registering DBus media key handler");

    const listener = (n: any, keyName: string) => {
        logger.info("Dbus listener: " + keyName);
        switch (keyName) {
          case 'Next': callback(MediaKeys.MEDIA_NEXT_TRACK); return;
          case 'Previous': callback(MediaKeys.MEDIA_PREVIOUS_TRACK); return;
          case 'Play': callback(MediaKeys.MEDIA_PLAY_PAUSE); return;
          case 'Stop': callback(MediaKeys.MEDIA_STOP); return;
          default: return;
        }
    };

    const dbusSession = dbus.sessionBus();
    for (const desktop of [ 'gnome', 'mate' ]) {
        const interfaceName = `org.${desktop}.SettingsDaemon.MediaKeys`;
        const proxyPath = `/org/${desktop}/SettingsDaemon/MediaKeys`;

        for (const proxyName of [ `org.${desktop}.SettingsDaemon.MediaKeys`, `org.${desktop}.SettingsDaemon` ]) {
            try {
                logger.info('interfaceName: ' + interfaceName);
                logger.info('proxyPath: ' + proxyPath);
                logger.info('proxyName: ' + proxyName);

                const dbusProxy = await dbusSession.getProxyObject(proxyName, proxyPath);
                const dbusInterface = dbusProxy.getInterface(interfaceName);
                dbusInterface.on('MediaPlayerKeyPressed', listener);

                app.on('browser-window-focus', () => {
                    dbusInterface.GrabMediaPlayerKeys('MAESTRO', 0); // eslint-disable-line
                });
            } catch (err) {
                logger.error('Error registering', err);
            }
        }
    }
}

/**
 * Register a handler for MPRIS DBus events
 *
 * @param logger
 * @param callback
 */
function registerMprisKeyHandler(logger: winston.Logger, callback: (mediaKey: MediaKeys) => void) {
    logger.info("Registering mpris media key handler");

    player.on('play', () => {
        logger.info("MPRIS Play");
        callback(MediaKeys.MEDIA_PLAY);
    });

    player.on('pause', () => {
        logger.info("MPRIS Pause");
        callback(MediaKeys.MEDIA_PAUSE);
    });

    player.on('playpause', () => {
        logger.info("MPRIS PlayPause");
        callback(MediaKeys.MEDIA_PLAY_PAUSE);
    });

    player.on('next', () => {
        logger.info("MPRIS Next");
        callback(MediaKeys.MEDIA_NEXT_TRACK);
    });

    player.on('previous', () => {
        logger.info("MPRIS Previous");
        callback(MediaKeys.MEDIA_PREVIOUS_TRACK);
    });

    player.on('stop', () => {
        logger.info("MPRIS Stop");
        callback(MediaKeys.MEDIA_STOP);
    });
}

/**
 * Register Linux-specific handlers for Media keys
 *
 * @param logger
 * @param callback
 */
export async function registerLinuxMediaKeyHandlers(logger: winston.Logger, callback: (mediaKey: MediaKeys) => void) {
    logger.info("Registering Linux media key handlers");
    registerMprisKeyHandler(logger, callback);
    await registerDbusMediaKeyHandler(logger, callback);
}
