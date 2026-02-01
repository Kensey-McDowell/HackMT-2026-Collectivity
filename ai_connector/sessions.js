//Session tracker to track conversation history and maintain chat state across webpage changes/refreshes

const session_memory = new Map();

//This method retrieves the ID of the chat history and, if it does not exists, creates the session.
//Returns the history of the chat
export function getSession(sessionId) {
    if (!session_memory.has(sessionId)) {
        session_memory.set(sessionId, []);
    }

    return session_memory.get(sessionId);
}

//This method appends the latest entry to the chat history.
//If the history is longer than 20 turns, splice it to limit context sent.
export function appendToSession(sessionId, entry) {
    const conversation_history = getSession(sessionId);
    conversation_history.push(entry);

    if (conversation_history.length > 20) {
        conversation_history.splice(0, conversation_history.length - 20);
    }
}