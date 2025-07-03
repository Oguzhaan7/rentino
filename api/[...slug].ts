import { FastifyInstance } from "fastify";
import { build } from "../apps/backend/src/index";

let cachedHandler: FastifyInstance | null = null;

export default async function handler(req: any, res: any) {
  if (!cachedHandler) {
    cachedHandler = await build();
  }

  await cachedHandler.ready();
  cachedHandler.server.emit("request", req, res);
}
