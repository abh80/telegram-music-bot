import { StringSession } from "telegram/sessions/index.js";
import fs from "fs";
import input from "input";
import Client from "./Base/Client.js";
import dotenv from "dotenv";
import { TelegramClient } from "telegram";
import path from "path";
import { fileURLToPath } from "url";
import WebSocket from "ws";
import Auth from "./Base/modules/auth.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

dotenv.config();

async function start() {
  const appid = 18099302;
  const apiHash = "493fe32f909349d229d1fe8fb4f04f14";
  let sessionFilePath = path.join(__dirname, "storage", "session.txt");
  if (!fs.existsSync(sessionFilePath)) fs.writeFileSync(sessionFilePath, "");
  const stringsession = new StringSession(
    fs.readFileSync(sessionFilePath, {
      encoding: "ascii",
    })
  );
  const client = new Client(stringsession, appid, apiHash, {
    connectionRetries: 5,
  });
  let auth = new Auth();

  await client.start({
    phoneNumber: async () => {
      await auth.connect(process.env.auth_server_url);
      return await auth.getPhoneCode();
    },
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () => await auth.getCode(),
    onError: (err) => console.log(err),
  });
  fs.writeFileSync(sessionFilePath, client.session.save());
  if (auth.ws) auth.closeSocket();
  const bot = new TelegramClient(new StringSession(""), appid, apiHash);
  await bot.start({ botAuthToken: process.env.bot_token });
  client.setBot(bot);
}
start();
