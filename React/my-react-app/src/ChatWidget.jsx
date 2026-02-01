import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';

//API URL assumes the Express server is unchanged and locally hosted.
//Can be changed depending on URL of Express server.
 const API_URL="http://localhost:3001";

 //Gets the page types to be used for page context.
function getPageType(pathname) {
    if (pathname.startsWith("/faq")) return "faq";
    if (pathname.startsWith("/admin")) return "admin";
    if (pathname.startsWith("/profile")) return "profile";
    if (pathname.startsWith("/registration")) return "registration";
    if (pathname.startsWith("/intro")) return "intro";
    if (pathname.startsWith("/about")) return "about";
    if (pathname.startsWith("/social")) return "social";
    if (pathname.startsWith("/settings")) return "settings";
}

//This function uses the key information on the page to extract surface level content.
function collectPageContext(location) {
    const h1 = document.querySelector("h1")?.textContent?.trim() || null;

    return {
        url: window.location.href,
        route: location.pathname,
        title: document.title,
        h1,
        pageType: getPageType(location.pathname)
    };
}

//Creates the actual widget itself.
export default function ChatWidget() {
    const location = useLocation()

    //Use states for if the chatbox is open, input, loading, and changing messages.
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "model",
            content: "Hello! I'm Collector Helper! I can answer questions you have about this site or the collectibles listed within. How can I be of assistance?"
        }
    ])

    const listRef = useRef(null);

    //Scrolls as the conversation moves along.
    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth"});
    }, [messages, open]);

    //Quick chips are common questions to ask for a few pages.
    const quickChips = useMemo (() => {
        const pageType = getPageType(location.pathname);
        if (pageType === "faq") return ["What is rarity?", "How are items rated?", "What is this site about?"];
        if (pageType === "registration") return ["How do I register?", "Is an account required?"];
        return ["What is this site?", "How do I list an item?", "What is a collectible?"];
    }, [location.pathname]);

    //THis method sends the message to the backend.
    async function sendMessage(text) {
        //Trims the text. If the trimmed text contains nothing OR the bot is currently
        //loading a response, simply return.
        const trimmed = text.trim();
        if (!trimmed || loading) return;

        //Set the messages to the message and trimmed content.
        setMessages((m) => [...m, { role: "user", content: trimmed }]);
        setInput("");
        setLoading(true);

        //Try except to send the message and receive response.
        try {
            //Get page context of the current page.
            const pageContext = collectPageContext(location);

            //Send POST request with the JSONified message
            const resp = await fetch(`${API_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: "dev-sesh",
                    message: trimmed,
                    pageContext,
                }),
            });

            //If the response is not ok, throw an error.
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            //Get the data as a JSON.
            const data = await resp.json();

            //If the answer is null, return that a response couldn;t be generated.
            const answer = data?.answer || "Sorry, I was unable to generate a response...";
            const refused = !!data?.refused;
            const citations = Array.isArray(data?.citations) ? data.citations : [];

            //Set messages along with adding the sources.
            //If a refusal was reported, offer specific topics for the user to ask.
            setMessages((m) => [
                ...m, 
                {
                    role: "model",
                    content: 
                        answer + 
                        (citations.length
                            ? "\n\nSources:\n" +
                            citations.map((c) => `- ${c.sourceId}: "${c.quote}"`).join("\n") : "") +
                            (refused ? "\n\n(If you want, ask about a specfic term such as rarity)" : ""),
                }
            ]);
            //Catch any errors and report an issue to the user.
        } catch (e) {
            setMessages((m) => [
                ...m,
                {
                    role: "model",
                    content : "Sorry, there was an issue reaching the chat service. Please try again later."
                }
            ]);
        } finally {
            setLoading(false); //At the end of the block, set loading to false.
        }
    }

    //uiverse open-source chatbox
    return (
        <>
            { /* Button */ }
            <button
                onClick={() => setOpen((v) => !v)}
                className="fixed bottom-6 right-6 z-50 rounded-full bg-blue-600 text-white px-4 py-3 shadow-lg hover:bg-blue-700 transition"
                aria-label="Open chat"
            >
                {open ? "Close" : "Chat"}
            </button>

            {/* Panel */}
            {open && (
            <div className="fixed bottom-20 right-6 z-50 w-[360px] max-w-[92vw]">
                <div className="max-w-md mx-auto bg-white dark:bg-zinc-800 shadow-md rounded-lg overflow-hidden">
                <div className="flex flex-col h-[400px]">
                    {/* Header */}
                    <div className="px-4 py-3 border-b dark:border-zinc-700">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">
                        Collector Helper
                        </h2>
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Online
                        </div>
                    </div>
                    </div>

                    {/* Messages */}
                    <div
                    ref={listRef}
                    className="flex-1 p-3 overflow-y-auto flex flex-col space-y-2"
                    >
                    {messages.map((m, idx) => (
                        <div
                        key={idx}
                        className={[
                            "chat-message max-w-xs rounded-lg px-3 py-1.5 text-sm whitespace-pre-wrap",
                            m.role === "user"
                            ? "self-end bg-blue-500 text-white"
                            : "self-start bg-zinc-500 text-white",
                        ].join(" ")}
                        >
                        {m.content}
                        </div>
                    ))}

                    {loading && (
                        <div className="chat-message self-start bg-zinc-500 text-white max-w-xs rounded-lg px-3 py-1.5 text-sm">
                        Thinking...
                        </div>
                    )}
                    </div>

                    {/* (Optional) Quick chips styled a bit */}
                    <div className="px-3 pb-2 flex flex-wrap gap-2">
                    {quickChips.map((chip) => (
                        <button
                        key={chip}
                        onClick={() => sendMessage(chip)}
                        disabled={loading}
                        className="text-xs px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-600
                                    hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50
                                    text-zinc-700 dark:text-zinc-100"
                        >
                        {chip}
                        </button>
                    ))}
                    </div>

                    {/* Input */}
                    <div className="px-3 py-2 border-t dark:border-zinc-700">
                    <div className="flex gap-2">
                        <input
                        placeholder="Type your message..."
                        className="flex-1 p-2 border rounded-lg dark:bg-zinc-700 dark:text-white dark:border-zinc-600 text-sm"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") sendMessage(input);
                        }}
                        disabled={loading}
                        type="text"
                        />
                        <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg transition duration-300 ease-in-out text-sm disabled:opacity-50"
                        onClick={() => sendMessage(input)}
                        disabled={loading}
                        >
                        Send
                        </button>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            )}

        </>
    );
}