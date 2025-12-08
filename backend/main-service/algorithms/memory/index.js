/**
 * memory management algorithms index
 * exports all page replacement algorithms
 */

import fifo from './fifo.js';
import lru from './lru.js';
import lfu from './lfu.js';
import optimal from './optimal.js';
import mru from './mru.js';

export {
    fifo,
    lru,
    lfu,
    optimal,
    mru
};