// Creates a very basic Express server to control API endpoints.
//Will be used to connect the frontend chat to the Gemini API.
//Currently an unfinished template.

import express from "express";
import "dotenv/config";
import { agent } from "./gemini.mjs";
import { SYS_POLICY, buildPrompt } from "./policy.js";
import { getSession, appendToSession } from "./sessions.js";

//Create the Express app.
//Maximum JSON body size is 1mb.
const app = express();
app.use(express.json({ limit: "1mb" }))

//Create the /chat endpoint.
app.post("/chat", async(req, res) => {
    //Try/Except block
    try {
        //Get the sessionId and message from the request body.
        //If missing, report an error
        const { sessionId, message } = req.body || {};
        if (!sessionId || !message) {
            return res.status(400).json({ error: "sessionId and message are required..." });
        }

        const history = getSession(sessionId);
        const prompt = buildPrompt(message);

        const response = await agent.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
                { role: "user", parts: [{ text: SYS_POLICY }] },
                ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
                { role: "user", parts: [{ text: prompt }] }
            ],

        });

        //Start here with let text = ...

    //If an error occurs during execution, report the error.
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Chat failed..." });
    }
});