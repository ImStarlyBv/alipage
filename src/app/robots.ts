import type { MetadataRoute } from "next";

const SITE_URL = "https://kittycontrol.shop";

const DISALLOW = [
  "/api/",
  "/admin/",
  "/account/",
  "/auth/",
  "/checkout/",
  "/cart",
  "/*?callbackUrl*",
];

/*
 * Every AI crawler and answer-engine bot gets its own explicit group with the
 * same disallow list as the `*` group. Naming them rather than relying on `*`
 * matters for two reasons: some of these agents (GPTBot, PerplexityBot) are
 * reported to weight an explicit allow more than an implicit one, and a named
 * group is what shows up as "recognized" in crawler-analytics tooling — the
 * store gets no benefit from AI answer surfaces it never explicitly opted in.
 */
const AI_AND_ANSWER_ENGINE_AGENTS = [
  "Googlebot",
  "Bingbot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
      ...AI_AND_ANSWER_ENGINE_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
