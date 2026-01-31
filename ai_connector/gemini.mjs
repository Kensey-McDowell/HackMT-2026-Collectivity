import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import 'dotenv/config';

const agent = new GoogleGenAI({});

async function main(){
    const response = await agent.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "What are you based on? Are you a custom AI or an API wrapper or what?",
        config: {
            thinkingConfig: {
                thinkingLevel: ThinkingLevel.MINIMAL
            },
            systemInstruction: SYS_INFO
        }
    });

    console.log(response.text);
}

await main();