export default {
    async fetch(request, env) {

        const url = new URL(request.url);

        // --------------------------------
        // API TEST
        // --------------------------------

        if (url.pathname === "/api/test") {

            return jsonResponse({
                success: true,
                message: "Global News Dashboard API is working!",
                timestamp: new Date().toISOString()
            });
        }


        // --------------------------------
        // NEWS API
        // --------------------------------

        if (url.pathname === "/api/news") {

            const category =
                (url.searchParams.get("category") || "world")
                    .toLowerCase();


            // --------------------------------
            // WORLD NEWS
            // --------------------------------

            if (category === "world") {

                return fetchRssNews(
                    "https://feeds.bbci.co.uk/news/world/rss.xml",
                    "BBC",
                    "World"
                );

            }


            // --------------------------------
            // TECHNOLOGY NEWS
            // --------------------------------

            if (
                category === "technology" ||
                category === "tech"
            ) {

                return fetchRssNews(
                    "https://techcrunch.com/feed/",
                    "TechCrunch",
                    "Technology"
                );

            }


            // --------------------------------
            // INDIA NEWS
            // --------------------------------

            if (category === "india") {

                return fetchRssNews(
                    "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml",
                    "Hindustan Times",
                    "India"
                );

            }


            // --------------------------------
            // INVALID CATEGORY
            // --------------------------------

            return jsonResponse(
                {
                    success: false,
                    error: "Unsupported news category",
                    supportedCategories: [
                        "world",
                        "technology",
                        "india"
                    ]
                },
                400
            );

        }


        // --------------------------------
        // WEBSITE
        // --------------------------------

        return env.ASSETS.fetch(request);

    }
};


// --------------------------------
// RSS FETCHER
// --------------------------------

async function fetchRssNews(
    rssUrl,
    source,
    category
) {

    try {

        const response =
            await fetch(rssUrl);


        if (!response.ok) {

            return jsonResponse(
                {
                    success: false,
                    source: source,
                    category: category,
                    error:
                        `Unable to fetch ${source} RSS feed`
                },
                502
            );

        }


        const xml =
            await response.text();


        const items = [];


        const itemMatches =
            xml.match(
                /<item>[\s\S]*?<\/item>/g
            ) || [];


        for (
            const item
            of itemMatches.slice(0, 10)
        ) {

            const titleMatch =
                item.match(
                    /<title>([\s\S]*?)<\/title>/
                );


            const linkMatch =
                item.match(
                    /<link>([\s\S]*?)<\/link>/
                );


            const pubDateMatch =
                item.match(
                    /<pubDate>([\s\S]*?)<\/pubDate>/
                );


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


            if (
                title &&
                link
            ) {

                items.push({

                    title: title,

                    source: source,

                    category: category,

                    published: published,

                    url: link

                });

            }

        }


        return jsonResponse({

            success: true,

            source: source,

            category: category,

            count: items.length,

            articles: items

        });

    }


    catch (error) {

        return jsonResponse(
            {
                success: false,

                source: source,

                category: category,

                error: error.message
            },
            500
        );

    }

}


// --------------------------------
// XML DECODER
// --------------------------------

function decodeXml(text) {

    return text
        .replace(
            /<!\[CDATA\[([\s\S]*?)\]\]>/g,
            "$1"
        )
        .replace(
            /&amp;/g,
            "&"
        )
        .replace(
            /&lt;/g,
            "<"
        )
        .replace(
            /&gt;/g,
            ">"
        )
        .replace(
            /&quot;/g,
            '"'
        )
        .replace(
            /&#39;/g,
            "'"
        );

}


// --------------------------------
// JSON RESPONSE
// --------------------------------

function jsonResponse(
    data,
    status = 200
) {

    return new Response(
        JSON.stringify(data),
        {
            status: status,

            headers: {
                "Content-Type":
                    "application/json",

                "Cache-Control":
                    "public, max-age=300"
            }
        }
    );

}
