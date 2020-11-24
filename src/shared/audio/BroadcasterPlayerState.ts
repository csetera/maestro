/**
 * Representation of current state of the player.
 */
export default interface BroadcasterPlayerState {
    // Basic play controls
    playerControlsAvailable?: boolean;
    playing?: boolean;
    paused?: boolean;
    stopped?: boolean;

    // Playback information
    station?: string;
    artist?: string;
    title?: string;
    imageSrc?: string;

    // Progress tracking
    progress?: number; // Percentage of completion
    progressPrefix?: string;
    progressSuffix?: string;
}