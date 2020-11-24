import { isDevelopment } from '@/shared/Utils';
import IpcLoggerTransport from '@/shared/IpcLoggerTransport';
import * as fs from 'fs';
import * as Electron from 'electron';
import * as path from 'path';
import * as winston from 'winston';

/**
 * Helper class for creating Winston logger instances.
 */
export default class LoggerFactory {
    /**
     * Create the main Logger instance.
     * 
     * @param app The Electron App 
     * @param label The label to be used for this logger
     * @param filename THe filename to be used for the logging output
     */
    public static createMainLogger(app: Electron.App, label: string, filename = 'maestro.log'): winston.Logger {
        const loggingFormat = winston.format.combine(
            winston.format.splat(),
            winston.format.timestamp({  }),
            winston.format.printf((info) => {
                return `[${info.timestamp}] [${info.label || label}] ${info.message}`;
            }));

        const logsFolder = path.resolve(app.getPath('userData'), 'logs');
        if (!fs.existsSync(logsFolder)){
            fs.mkdirSync(logsFolder, { recursive: true });
        }

        return winston.createLogger({
            exitOnError: false, 
            transports: [
                new winston.transports.File({
                    filename: path.resolve(logsFolder, filename),
                    level: isDevelopment ? 'debug' : 'info',
                    format: loggingFormat,
                    maxsize: 5000000,
                    maxFiles: 2,
                    tailable: true,
                }),
                new winston.transports.Console({
                    level: isDevelopment ? 'debug' : 'error',
                    format: loggingFormat,
                }),
            ],
            exceptionHandlers: [
                new winston.transports.File({ 
                    filename: path.resolve(logsFolder, 'exceptions.log') 
                })
            ]
        });
    }

    /**
     * Create a Logger instance to forward log messages to the main
     * process via IPC.
     * 
     * @param ipc the IPC pipe used to forward the logging message
     * @param label The label to be used for the logging output
     */
    public static createIpcLogger(ipc: Electron.IpcRenderer, label: string): winston.Logger {
        return winston.createLogger({
            exitOnError: false, 
            transports: [ new IpcLoggerTransport({ ipc: ipc, label: label }) ]
        });
    }
}