import { listenAndServe } from "https://deno.land/std/http/server.ts";
import { acceptWebSocket, acceptable } from "https://deno.land/std/ws/mod.ts";
import chatRun from "./chat.ts";

listenAndServe({ port: 8000 }, async (req) => {
  if (req.method === "GET" && req.url === "/ws") {
    if (acceptable(req)) {
      acceptWebSocket({
        conn: req.conn,
        bufReader: req.r,
        bufWriter: req.w,
        headers: req.headers
      }).then(chatRun);
    }
  }
});
console.log("Server started on port 8000");
