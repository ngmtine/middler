import type { Page } from "puppeteer-core";
import { getBrowserIp } from "../util/getBrowserIp";

const { env }: { env: any } = process;

// Pageオブジェクト取得
export const startBrowser = async (url: string): Promise<Page> => {
    const puppeteer = await import("puppeteer-core");

    // ブラウザ起動
    const browserIp = env.browserIp ?? getBrowserIp();
    const browserPort = env.browserPort ?? 9222;
    const options = { browserURL: `http://${browserIp}:${browserPort}`, timeout: 5000 };
    const browser = await puppeteer.connect(options);

    // chatgptにアクセス
    const chatgptPage = await browser.newPage();
    await chatgptPage.goto(url, { waitUntil: "domcontentloaded" });

    return chatgptPage;
};
