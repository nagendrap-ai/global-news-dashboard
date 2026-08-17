export default {
    async fetch(request, env) {

        const url = new URL(request.url);

        // --------------------------------
        // API TEST
        // --------------------------------

        if (url.pathname === "/api/test") {

            return new Response(
                JSON.stringify({
                    success: true,
                    message: "Global News Dashboard API is working!",
                    timestamp: new Date().toISOString()
                }),
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }


        // --------------------------------
        // WORLD NEWS RSS
        // --------------------------------

        if (url.pathname === "/api/news") {

            try {

                const rssUrl =
                    "https://feeds.bbci.co.uk/news/world/rss.xml";

                const response = await fetch(rssUrl);

                if (!response.ok) {

                    return new Response(
                        JSON.stringify({
                            success: false,
                            error: "Unable to fetch BBC RSS feed"
                        }),
                        {
                            status: 502,
                            headers: {
                                "Content-Type": "application/json"
                            }
                        }
                    );
                }


                const xml = await response.text();


                // Extract RSS items

                const items = [];

                const itemMatches =
                    xml.match(/<item>[\s\S]*?<\/item>/g) || [];


                for (const item of itemMatches.slice(0, 10)) {

                    const titleMatch =
                        item.match(/<title>([\s\S]*?)<\/title>/);

                    const linkMatch =
                        item.match(/<link>([\s\S]*?)<\/link>/);

                    const pubDateMatch =
                        item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);


                    const title =
                        titleMatch
                            ? decodeXml(titleMatch[1])
                            : "";


                    const link =
                        linkMatch
                            ? decodeXml(linkMatch[1])
                            : "";


                    const published =
                        pubDateMatch
                            ? decodeXml(pubDateMatch[1])
                            : "";


                    if (title && link) {

                        items.push({

                            title: title,

                            source: "BBC",

                            category: "World",

                            published: published,

                            url: link

                        });

                    }

                }


                return new Response(
                    JSON.stringify({
                        success: true,
                        source: "BBC",
                        category: "World",
                        count: items.length,
                        articles: items
                    }),
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Cache-Control": "public, max-age=300"
                        }
                    }
                );


            } catch (error) {

                return new Response(
                    JSON.stringify({
                        success: false,
                        error: error.message
                    }),
                    {
                        status: 500,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );

            }

        }


        // --------------------------------
        // WEBSITE
        // --------------------------------

        return env.ASSETS.fetch(request);

    }
};


// --------------------------------
// XML DECODER
// --------------------------------

function decodeXml(text) {

    return text
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

}
