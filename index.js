import { StringSession } from "telegram/sessions/index.js";
import fs from "fs";
import input from "input";
import Client from "./Base/Client.js";
import dotenv from "dotenv";
import { TelegramClient } from "telegram";

dotenv.config();

async function start() {
  const appid = 18099302;
  const apiHash = "493fe32f909349d229d1fe8fb4f04f14";

  const stringsession = new StringSession(
    fs.readFileSync("./session.txt", { encoding: "ascii" })
  );
  const client = new Client(stringsession, appid, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("Please enter your number: "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () =>
      await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err),
  });
  const bot = new TelegramClient(new StringSession(""), appid, apiHash);
  await bot.start({ botAuthToken: process.env.bot_token });
  client.setBot(bot);
  fs.writeFileSync("./session.txt", client.session.save());
}
start();
