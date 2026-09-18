const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.method !== "POST" || req.url !== "/chat") {
    res.writeHead(404);
    return res.end("Not Found");
  }

  let body = "";

  req.on("data", chunk => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      const { message } = JSON.parse(body);

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "openrouter/free",
            messages: [
              {
                role: "system",
                content:
                  "You are Fanci AI, a friendly and helpful assistant. Answer clearly and naturally."
              },
              {
                role: "user",
                content: message
              }
            ]
          })
        }
      );

      const data = await response.json();

      const reply =
        data?.choices?.[0]?.message?.content ||
        "Maaf, Fanci belum bisa menjawab.";

      res.writeHead(response.ok ? 200 : response.status, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({ reply }));
    } catch (error) {
      res.writeHead(500, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        reply: "Terjadi kesalahan pada server Fanci AI."
      }));
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Fanci AI server running on port ${PORT}`);
});
