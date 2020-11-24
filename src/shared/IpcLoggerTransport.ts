import { IpcRenderer } from 'electron';
import { LOG_MESSAGE } from '@/shared/constants/IpcCommands';
import TransportStream from 'winston-transport';

/**
 * A Winston Transport implementation that transfers the
 * logged messages across IPC to the main process.
 */
export default class IpcLoggerTransport extends TransportStream {
    ipc: IpcRenderer;
    label: string;

    /**
     * Constructor function for the transport object responsible for
     * forwarding the message via IPC.
     * 
     * @param {!Object} [options={}] - Options for this instance.
     */
    constructor(options = {}) {
        super(options);

        this.ipc = (options as any).ipc as IpcRenderer;
        this.label = (options as any).label;
        this.setMaxListeners(30);
    }

    /**
     * Handle the logging for the transport.
     * 
     * @param info 
     * @param callback 
     */
    public log(info: any, callback: Function): void {
        setImmediate(() => this.emit('logged', info));

        info.label = info.label || this.label;
        this.ipc.send(LOG_MESSAGE, info);

        if (callback) {
            callback(); // eslint-disable-line callback-return
        }
    }
}
