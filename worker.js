export default {
    async fetch(request, env) {

        const url = new URL(request.url);

        // Test API
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

        // Serve the website
        return env.ASSETS.fetch(request);
    }
};
