// The Network Information API is experimental and only implemented in
// Chromium-based browsers — Safari and Firefox simply don't expose
// `navigator.connection`. This fails OPEN (assumes an acceptable connection)
// when it's unavailable, rather than blocking background prefetching for
// browsers that don't report it.
interface NetworkInformation {
    saveData?: boolean;
    effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
}

// Background prefetching only ever makes pages feel faster later, at the
// cost of data used now. On a connection this constrained (or with Data
// Saver explicitly turned on), that trade isn't worth it — the prefetch
// would compete for the same scarce bandwidth as whatever the user is
// actually trying to load right now, which measurably slows down the page
// they're on without enough time left to finish before they'd navigate away
// anyway. Respect that instead of forcing the trade on them.
export const shouldAvoidBackgroundPrefetch = (): boolean => {
    const connection = (
        navigator as Navigator & { connection?: NetworkInformation }
    ).connection;
    if (!connection) return false;
    if (connection.saveData) return true;
    if (
        connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g"
    ) {
        return true;
    }
    return false;
};
