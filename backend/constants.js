export const PROCESSES = {
    STATES: {
        NEW: "NEW",
        READY: "READY", 
        RUNNING: "RUNNING",
        WAIT: "WAIT",
        DONE: "DONE"
    },
    BREAK_TIMER: 1000 // Safety limit to prevent infinite loops
};