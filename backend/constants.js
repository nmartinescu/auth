export const PROCESSES = {
    STATES: {
        NEW: "NEW",
        READY: "READY", 
        RUNNING: "RUNNING",
        WAIT: "WAIT",
        DONE: "DONE"
    },
    BREAK_TIMER: 20 // Safety limit to prevent infinite loops
};