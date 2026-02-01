// Creates a very basic Express server to control API endpoints.
//Will be used to connect the frontend chat to the Gemini API.
//Currently an unfinished template.

import express from "express";
import "dotenv/config";
import { agent } from "./gemini.mjs";
import { SYS_POLICY, buildPrompt } from "./policy.mjs";
import { getSession, appendToSession } from "./sessions.mjs";
import cors from "cors";
import { scrapeUrlToText } from "./scraper.mjs";

//Create the Express app.
//Maximum JSON body size is 1mb.
const app = express();
app.use(express.json({ limit: "1mb" }))
app.use(cors({ origin: "http://localhost:5173" })); 
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

//Create the /chat endpoint.
app.post("/chat", async(req, res) => {
    //Try/Except block
    try {
        //Get the sessionId and message from the request body.
        //If missing, report an error
        const { sessionId, message, pageContext } = req.body || {};
        if (!sessionId || !message) {
            return res.status(400).json({ error: "sessionId and message are required..." });
        }

        //Get session history and build the prompt with the message and page context.
        const history = getSession(sessionId);
        const prompt = buildPrompt(message, pageContext);

        //Generate the response from Gemini with the Gemini API.
        const response = await agent.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                { role: "user", parts: [{ text: SYS_POLICY }] },
                ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
                { role: "user", parts: [{ text: prompt }] }
            ],

        });

        //Trim the text to guarantee a string is returned, and remove trailing/leading whitespace.
        let text = response.text?.trim() ?? "";

        //This removes all other potential parts of the response and returns ONLY the JSON we expect.
        const a = text.indexOf("{");
        const b = text.lastIndexOf("}");
        if (a >= 0 && b > a) text = text.slice(a, b+1);

        //Try/Except to parse the text.
        let out;
        try {
            out = JSON.parse(text);
        } catch {
            out = { answer: response.text ?? "", citations: [], refused: false };
        }

        //Append this current turn to the chat history.
        appendToSession(sessionId, { role: "user", content: message });
        appendToSession(sessionId, { role: "model", content: out.answer });

        //Console logging.
        console.log("Responding with:", out);

        console.log("Body:", req.body);

        //Send the result back as a JSON.
        res.json(out);
    //If an error occurs during execution, report the error.
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Chat failed..." });
    }
});

//Run the server on port 3001.
const PORT = 3001;
app.listen(PORT, () => console.log(`Chatbot backend listening on port ${PORT}`))