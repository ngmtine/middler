// HTMLDivElementをMarkdownに変換
export const html2markdown = (div: Node): string => {
    return processNode(div);
};

// ノードを再帰的に処理する関数
const processNode = (node: Node): string => {
    let out = "";

    // Node.TEXT_NODE
    if (node.nodeType === 3) {
        out += node.textContent?.trim();
    }

    // Node.ELEMENT_NODE
    else if (node.nodeType === 1) {
        const elm = node as HTMLElement;
        switch (elm.tagName) {
            case "LI":
                out += "- " + processChildren(elm) + "\n";
                break;
            case "OL":
            case "UL":
                out += processChildren(elm) + "\n";
                break;
            case "P":
                out += processChildren(elm) + "\n\n";
                break;
            case "CODE":
                out += `\`${elm.textContent}\``;
                break;
            case "STRONG":
                out += `*${elm.textContent}*`;
                break;
            case "H1":
                out += `# ${elm.textContent}\n`;
                break;
            case "H2":
                out += `## ${elm.textContent}\n`;
                break;
            case "H3":
                out += `### ${elm.textContent}\n`;
                break;
            case "H4":
                out += `#### ${elm.textContent}\n`;
                break;
            case "H5":
                out += `##### ${elm.textContent}\n`;
                break;
            case "H6":
                out += `###### ${elm.textContent}\n`;
                break;
            case "PRE": {
                const lang = elm.querySelector("span")?.textContent ?? "";
                const code = elm.querySelector("code")?.textContent ?? "";
                out += `\n\`\`\`${lang}\n${code}\`\`\`\n\n`;
                break;
            }
            case "BR":
                out += "\n";
                break;
            default:
                out += processChildren(elm);
        }
    }

    // その他の場合（chatgptのwebが返すdomにはおそらく存在しないはず）
    else {
        console.warn("unexpected node!!");
        console.warn(node.textContent);
    }

    return out;
};

// 子ノードを再帰的に処理する関数
const processChildren = (element: HTMLElement): string => {
    let out = "";
    const children = [...element.childNodes];
    for (const child of children) {
        out += processNode(child);
    }
    return out;
};
