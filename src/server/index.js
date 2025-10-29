import http from "http";
import express from "express";
import path from "path";
import fs from "fs";
import { Server as SocketIO } from "socket.io";
import params from "../../params.js";
import { socket_init } from "./socket.js";
import { loginfo } from "./log.js";

const __dirname = process.cwd();

// --- pure async initApp (no callbacks) ---
async function initApp(server, app, { host, port }) {
  app.use((req, res, next) => {
    res.setHeader("ngrok-skip-browser-warning", "true");
    next();
  });

  app.use(express.static(path.join(__dirname, "public")));
  app.use(express.static(path.join(__dirname, "dist")));

  app.get("/api/history", (req, res) => {
    const data = JSON.parse(
      fs.readFileSync(path.join(__dirname, "history.json"), "utf-8")
    );
    res.json(data.reverse());
  });

  // No callback version — await server.listen directly
  await server.listen(port, host);
  console.log(`✅ Server running on http://${host}:${port}`);
}

// --- pure async create() ---
export async function create({ host, port }) {
  const app = express();
  const server = http.createServer(app);

  await initApp(server, app, { host, port });

  const io = new SocketIO(server, {
    cors: { origin: "*" },
    path: "/ws/red/socket.io",
    transports: ["websocket"],
  });

  socket_init(io);

  async function stop() {
    io.close();
    await server.close();
    loginfo("Engine stopped.");
  }

  return { stop };
}

// --- Run immediately if this file is executed directly ---
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await create(params.server);
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
}
