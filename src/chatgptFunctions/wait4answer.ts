import { setInterval as promiseSetInterval } from "node:timers/promises";
import type { Page } from "puppeteer-core";
import { html2markdown } from "../util/html2markdown";
import { text2HTMLDocument } from "../util/text2HTMLDocument";

const { env }: { env: any } = process;

type Returns = {
    text: string;
    html: string;
};

let prevConversationTurn = "";

// chatgptの回答を待つ
export const wait4answer = async ({ page }: { page: Page }): Promise<Returns> => {
    console.log(`prevConversationTurn: ${prevConversationTurn}`);

    let text = "";
    let html = "";
    let loopCounter = 0;

    const interval = env.waitingInterval ?? 1000;
    const timer = promiseSetInterval(interval);

    for await (const _ of timer) {
        try {
            // 応答がない場合強制終了
            loopCounter++;
            if (loopCounter > 100) {
                text = "timeout!! No response from chatgpt!!";
                break;
            }

            // ヘッドレスで起動している場合は不要
            page.bringToFront();

            // 最後の回答の要素を取得
            const messageContentList = await page.$$("article[data-testid]");
            const lastMessageSection = messageContentList.at(-1);
            if (!lastMessageSection) continue;

            // 最後の回答の要素の平文htmlを取得
            const htmlText = await lastMessageSection.evaluate((div) => div.outerHTML);

            // HTMLDivElementに変換
            const doc = text2HTMLDocument(htmlText);
            const div = doc.getElementsByTagName("article")?.[0];
            if (!div) continue;

            // 前回の回答を取得した場合はループ継続
            const conversationTurn = div.dataset.testid ?? "";
            if (prevConversationTurn === conversationTurn) continue;

            // 回答の親要素取得
            const answerDiv = div.querySelector("div.markdown") as HTMLDivElement | null;
            if (!answerDiv) continue;

            // 回答生成中ならばループ継続
            const isGenerating = answerDiv.classList.contains("result-streaming");
            if (isGenerating) continue;

            // markdownテキストを取得
            text = html2markdown(answerDiv);

            // 回答完了したらループ終了
            prevConversationTurn = conversationTurn;
            html = answerDiv.outerHTML;
            break;
        } catch (error) {
            console.error(error);
        }
    }

    return { text, html };
};
