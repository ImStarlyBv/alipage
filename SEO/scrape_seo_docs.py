"""
Playwright script to scrape Google Search Central SEO docs into a single .md file.
Parses links from the downloaded SEO.txt, visits each page, extracts main content.
"""

import asyncio
import re
import os
from pathlib import Path
from playwright.async_api import async_playwright

BASE_URL = "https://developers.google.com"
SEO_TXT = Path(__file__).parent / "SEO.txt"
OUTPUT_MD = Path(__file__).parent / "google_seo_docs.md"


def extract_doc_links(html_path: str) -> list[str]:
    """Extract unique /search/docs/ links from the saved HTML."""
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()
    links = sorted(set(re.findall(r'href="(/search/docs/[^"]+)"', html)))
    # Filter out anchors-only and query params
    links = [l for l in links if not l.endswith("#")]
    return links


async def scrape_page(page, url: str) -> tuple[str, str]:
    """Visit a page and extract the title + main article content as text."""
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        # Wait for article body to load
        await page.wait_for_selector("devsite-content article, .devsite-article-body", timeout=10000)

        # Extract title
        title = await page.evaluate("""
            () => {
                const h1 = document.querySelector('h1');
                return h1 ? h1.innerText.trim() : document.title;
            }
        """)

        # Extract article body content as clean text
        content = await page.evaluate("""
            () => {
                const article = document.querySelector('.devsite-article-body')
                    || document.querySelector('devsite-content article')
                    || document.querySelector('article');
                if (!article) return '';

                // Remove nav, aside, script, style elements
                article.querySelectorAll('nav, aside, script, style, devsite-page-rating, devsite-feedback').forEach(el => el.remove());

                // Convert headings
                function processNode(node) {
                    let md = '';
                    for (const child of node.childNodes) {
                        if (child.nodeType === 3) { // text
                            md += child.textContent;
                        } else if (child.nodeType === 1) { // element
                            const tag = child.tagName.toLowerCase();
                            if (tag === 'h1') md += '\\n# ' + child.innerText.trim() + '\\n\\n';
                            else if (tag === 'h2') md += '\\n## ' + child.innerText.trim() + '\\n\\n';
                            else if (tag === 'h3') md += '\\n### ' + child.innerText.trim() + '\\n\\n';
                            else if (tag === 'h4') md += '\\n#### ' + child.innerText.trim() + '\\n\\n';
                            else if (tag === 'p') md += child.innerText.trim() + '\\n\\n';
                            else if (tag === 'li') md += '- ' + child.innerText.trim() + '\\n';
                            else if (tag === 'ul' || tag === 'ol') md += processNode(child) + '\\n';
                            else if (tag === 'pre' || tag === 'code') md += '```\\n' + child.innerText.trim() + '\\n```\\n\\n';
                            else if (tag === 'table') {
                                // Simple table extraction
                                const rows = child.querySelectorAll('tr');
                                rows.forEach((row, i) => {
                                    const cells = row.querySelectorAll('th, td');
                                    const line = Array.from(cells).map(c => c.innerText.trim()).join(' | ');
                                    md += '| ' + line + ' |\\n';
                                    if (i === 0) {
                                        md += '| ' + Array.from(cells).map(() => '---').join(' | ') + ' |\\n';
                                    }
                                });
                                md += '\\n';
                            }
                            else if (tag === 'a') md += '[' + child.innerText.trim() + '](' + (child.href || '') + ')';
                            else if (tag === 'strong' || tag === 'b') md += '**' + child.innerText.trim() + '**';
                            else if (tag === 'em' || tag === 'i') md += '*' + child.innerText.trim() + '*';
                            else if (tag === 'br') md += '\\n';
                            else if (tag === 'img') {
                                // skip images
                            }
                            else md += processNode(child);
                        }
                    }
                    return md;
                }
                return processNode(article);
            }
        """)

        return title, content.strip()
    except Exception as e:
        return url, f"*Error scraping: {e}*"


async def main():
    links = extract_doc_links(str(SEO_TXT))
    print(f"Found {len(links)} doc pages to scrape")

    md_parts = ["# Google Search Central - SEO Documentation\n\n"]
    md_parts.append(f"*Scraped {len(links)} pages from developers.google.com*\n\n")
    md_parts.append("---\n\n")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            locale="en-US",
            extra_http_headers={"Accept-Language": "en-US,en;q=0.9"}
        )
        page = await context.new_page()

        for i, link in enumerate(links):
            url = BASE_URL + link
            print(f"[{i+1}/{len(links)}] Scraping: {link}")
            title, content = await scrape_page(page, url)

            md_parts.append(f"## {title}\n\n")
            md_parts.append(f"*Source: {url}*\n\n")
            md_parts.append(content + "\n\n")
            md_parts.append("---\n\n")

            # Small delay to be polite
            await asyncio.sleep(1)

        await browser.close()

    # Write output
    OUTPUT_MD.write_text("\n".join(md_parts), encoding="utf-8")
    print(f"\nDone! Output saved to: {OUTPUT_MD}")
    print(f"Total size: {OUTPUT_MD.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    asyncio.run(main())
