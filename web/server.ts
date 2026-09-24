import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initializeSocketServer } from "./src/lib/socket/server";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "127.0.0.1";
const port = parseInt(process.env.PORT || "3000", 10);

// Create the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    // Parse URL
    const parsedUrl = parse(req.url!, true);
    
    // Socket.IO wraps this listener and handles its own path.
    // Let Next.js handle other requests
    handle(req, res, parsedUrl).catch((err) => {
      console.error("Error occurred handling", req.url, err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end("internal server error");
      }
    });
  });

  // Initialize Socket.IO server
  initializeSocketServer(httpServer);

  httpServer
    .once("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log("> Socket.IO server initialized");
    });
});