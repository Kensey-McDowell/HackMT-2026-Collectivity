import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';

API_URL="TBD";

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

export default function ChatWidget() {
    const location = useLocation()

    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hello! I'm Collector Helper! I can answer questions you have about this site or the collectibles listed within. How can I be of assistance?"
        }
    ])

    const listRef = useRef(null);

    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth"});
    }, [messages, open]);

    const quickChips = useMemo (() => {
        const pageType = getPageType(location.pathname);
        if (pageType === "faq") return ["What is rarity?", "How are items rated?", "What is this site about?"];
        if (pageType === "registration") return ["How do I register?", "Is an account required?"];
        return ["What is this site?", "How do I list an item?", "What is a collectible?"];
    }, [location.pathname]);

    async function sendMessage(text) {
        const trimmed = text.trimmed();
        if (!trimmed || loading) return;

        setMessages((m) => [...m, { role: "user", content: trimmed }]);
        setInput("");
        setLoading(true);

        try {
            const pageContext = collectPageContext(location);

            const resp = await fetch(`${API_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: trimmed,
                    pageContext,
                }),
            });

            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();

            const answer = data?.answer || "Sorry, I was unable to generate a response...";
            const refused = !!data?.refused;
            const citations = Array.isArray(data?.citations) ? data.citations : [];

            setMessages((m) => [
                ...m, 
                {
                    role: "assistant",
                    content: 
                        answer + 
                        (citations.length
                            ? "\n\nSources:\n" +
                            citations.map((c) => `- ${c.sourceId}: "${c.quote}"`).join("\n") : "") +
                            (refused ? "\n\n(If you want, ask about a specfic term such as rarity)" : ""),
                }
            ]);
        } catch (e) {
            setMessages((m) => [
                ...m,
                {
                    role: "assistant",
                    content : "Sorry, there was an issue reaching the chat service. Please try again later."
                }
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            { /* Button */ }
            <button
                onClick={() => setOpen((v) => !v)}
                className="fixed bottom-6 right-6 z-50 rounded-full, bg-blue-600 text-white px-4 py-3 shadow-lg hover:bg-blue-700 transition"
                aria-label="Open chat"
            >
                {open ? "Close" : "Chat"}
            </button>

            { /* Panel */ }
            {open && (
                <div className="fixed bottom-20 right-6 z-50 w-[360px] max-w-[92vw] rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                        <div className="font-semibold">Collector Helper</div>
                        <div className="text-xs text-gray-500">{getPageType(location.pathname)}</div>
                    </div>

                    { /* Messages */ }
                    <div ref={listRef} className="h-[360px] overflow-y-auto p-3 space-y-3 bg-white">
                        {messages.map((m, idx) => (
                            <div
                                key={idx}
                                className={`whitespace-pre-wrap text-sm leading-relaxed ${
                                    m.role === "user" ? "text-right" : "text-left"
                                }`}
                            >
                                <span
                                    className={`inline-block rounded-2x1 px-3 py-2 ${
                                        m.role === "user"
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-900"
                                    }`}
                                >
                                    {m.content}
                                </span>
                            </div>
                        ))}
                        {loading && (
                            <div className="text-left text-sm">
                                <span className="inline-block rounded-2x1 px-3 py-2 bg-gray-100 text-gray-600">
                                    Thinking...
                                </span>
                            </div>
                        )}
                    </div>

                    { /* Quick Chips*/ }
                    <div className="px-3 pb-2 flex flex-wrap gap-2">
                        {quickChips.map((chip) => (
                            <button
                                key={chip}
                                onClick={() => sendMessage(chip)}
                                disabled={loading}
                                className="text-xs px-3 py-1 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                            >
                                {chip}
                            </button>
                        ))}
                    </div>

                    { /*Input*/ }
                    <div className="p-3 border-t bg-white flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") sendMessage(input);
                            }}
                            placeholder="Ask about rarity, condition, grading, etc."
                            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                        />
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={loading}
                            className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}