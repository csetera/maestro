import BroadcasterPlayerState from './BroadcasterPlayerState';
import * as winston from 'winston';

/**
 * Broadcaster implementations are injected into the
 * for the associated web audio application renderer process.
 * Broadcaster implementations communicate with the main process
 * via IPC to update the state of playback as well as receiving
 * events to control playback.
 * 
 * This abstract superclass provides default handling and structure
 * for implementing the Broadcaster interface.
 */
export default abstract class AbstractBroadcaster {    
    public hasPreviousTrack = false;
    public hasNextTrack = false;
	public hasSeparateStop = false;
	
    public hasProgress = false;
    public hasProgressPrefix = false;
    public hasProgressSuffix = false;

    public hasAlbumArt = false;
    public hasArtist = false;
    public hasGenre = false;
    public hasStation = false;
	public hasTitle = false;
	
	public disabled = false;
	public id = '';
	public name = '';
	public url = '';

	public logger = winston.createLogger({
		transports: [
		  new winston.transports.Console(),
		]
	  });

	/**
	 * Give the broadcaster a chance to configure itself.
	 * 
	 * @param window 
	 */
	public configure(window: Electron.BrowserWindow): void {
		// Do nothing by default
	}

	public getCurrentState(): BroadcasterPlayerState {
		return {};
	}

    public previousTrack(): void {}
    public nextTrack(): void {}
    public playPause(): void {}
	public stop(): void {}
	
	/**
	 * Click on an element in the DOM, as found via the selector.
	 * 
	 * @param selector 
	 */
    protected clickElement(selector: string): boolean {
		const elem = document.querySelector(selector);
		if (elem) {
			// Create our event (with options)
			const evt = new MouseEvent('click', {
				bubbles: true,
				cancelable: true,
				view: window
			});
			
			// If cancelled, don't dispatch our event
			return !elem.dispatchEvent(evt);
		} else {
			return false;
		}
	}

	/**
	 * Return the attribute value for the specified selector
	 * and attribute name. If not found, returns undefined.
	 * 
	 * @param selector 
	 */
    protected getAttribute(selector: string, attrName: string): string | undefined {
        const imgElement = document.querySelector(selector);
        if (imgElement) {
			const attrValue = imgElement.getAttribute(attrName);
			return (attrValue) ? attrValue : undefined;
        }

        return undefined;
    }

	/**
	 * Return the client height of the specified element.
	 * 
	 * @param selector 
	 */
	protected getElementClientHeight(selector: string): number {
		const element = document.querySelector(selector);
		return element ? element.clientHeight : 0;
	}

	/**
	 * Return the client width of the specified element.
	 * 
	 * @param selector 
	 */
	protected getElementClientWidth(selector: string): number {
		const element = document.querySelector(selector);
		return element ? element.clientWidth : 0;
	}

	/**
	 * Return the text of the selected element or 
	 * undefined if not found.
	 * 
	 * @param selector 
	 */
	protected getElementText(selector: string): string | undefined {
		const element = document.querySelector(selector);
		if (element) {
			if ((element.firstChild) && (element.firstChild.nodeType === Node.TEXT_NODE)) {
				const text = element.firstChild.textContent;
				return (text) ? text.trim() : undefined;
			}
		}

		return undefined;
	}

	/**
	 * Return the source URL of the selected element or 
	 * null if not found.
	 * 
	 * @param selector 
	 */
    protected getImageSource(selector: string): string | undefined {
		return this.getAttribute(selector, 'src');
    }

	/**
	 * Return the style attribute attached to the specified element
	 * as an object.
	 * 
	 * @param selector 
	 */
	protected getStyleAttributes(selector: string): any | undefined {
		const element = document.querySelector(selector);
		if (element) {
			const styleAttribute = element.getAttribute('style');
			if (styleAttribute) {
				return styleAttribute.split(';').reduce((accumulator: any, keyAndValue: string) => {
					const splitKeyAndValue = keyAndValue.split(':');
					accumulator[splitKeyAndValue[0]] = splitKeyAndValue[1];
					return accumulator;
				}, {});
			}
		}

		return undefined;
	}

    /**
     * Return a boolean indicating whether the specified selector
     * exists in the document.
     * 
     * @param selector 
     */
    protected hasElement(selector: string): boolean {
        return document.querySelector(selector) != null;
    }
}