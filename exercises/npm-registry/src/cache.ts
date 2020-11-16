import NodeCache = require('node-cache');

const SECONDS_IN_DAY = 60*60*24;

const node_cache = new NodeCache({ stdTTL: SECONDS_IN_DAY })

export const cache = function() {
    return node_cache;
}