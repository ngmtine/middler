import { writeFileSync } from "node:fs";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import type { Page } from "puppeteer-core";
import { postChatgpt } from "./chatgptFunctions/postChatgpt";
import { startBrowser } from "./chatgptFunctions/startBrowser";
import { wait4answer } from "./chatgptFunctions/wait4answer";

const { env }: { env: any } = process;

const app = new Hono();

let chatgptPage: Page;
(async () => {
    try {
        chatgptPage = await startBrowser(env.chatgptUrl);
    } catch (error) {
        console.error(error);
    }
})();

app.post("/api/chat", async (c) => {
    try {
        // ページオブジェクトが取得できていない場合はエラー
        if (!chatgptPage) throw new Error("chatgptPage undefined!!");

        // 質問取得
        const { text } = await c.req.json();
        if (!text) return c.json({ error: "text undefined!!" }, 200);
        console.log(`%cquestion: ${text}`, "background: white; color: blue;");

        // 質問投稿
        await postChatgpt({ page: chatgptPage, text });

        // 回答完了を待つ
        const { text: answerText, html: responseHtml } = await wait4answer({ page: chatgptPage });
        console.log(`%canswer: ${answerText}`, "background: white; color: red;");

        // markdownをローカルに保存
        if (answerText) {
            const filepath = "./response.md";
            writeFileSync(filepath, answerText);
            console.log(`HTML saved to ${filepath}`);
        }

        // htmlをローカルに保存
        if (responseHtml) {
            const filepath = "./response.html";
            writeFileSync(filepath, responseHtml);
            console.log(`HTML saved to ${filepath}`);
        }

        // 返却
        return c.json({ text: answerText, html: responseHtml });
    } catch (error: any) {
        console.error(error);
        return c.json({ error: error.message }, 200);
    }
});

serve({
    fetch: app.fetch,
    port: env.honoPort,
});
