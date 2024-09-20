import type { Page } from "puppeteer-core";

// chatgptに質問を投げる
export const postChatgpt = async ({ page, text }: { page: Page; text: string }) => {
    // ヘッドレスで起動している場合は不要
    page.bringToFront();

    // 入力欄要素取得
    const inputArea = await page.waitForSelector("#prompt-textarea");
    if (!inputArea) throw new Error("inputArea undefined!!");

    // 入力欄要素にテキスト入力
    await inputArea.evaluate((elm, val) => {
        // domにテキストを直接挿入
        elm.innerHTML = `<p>${val}</p>`;
        elm.dispatchEvent(new Event("input", { bubbles: true }));
    }, text);

    // 送信ボタン押下
    const button = await page.waitForSelector("main form button[data-testid='send-button']", { timeout: 1000 * 10 });
    if (!button) throw new Error("sendbutton undefined!!");
    await button.click();
};
