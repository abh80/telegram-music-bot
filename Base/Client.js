import { TelegramClient } from "telegram";
import handleMessage from "./../events/message.js";
import { NewMessage } from "telegram/events/index.js";
import Utils from "./Utils.js";
import fs from "fs";
import Player from "./modules/player.js";

export default class Client extends TelegramClient {
  constructor(...options) {
    super(...options);

    this.players = new Map();
    this.commands = new Map();
    this.aliases = new Map();
    this.utils = new Utils();
    this.loadCommands();
  }
  /**
   *
   * @param {TelegramClient} bot
   */
  async setBot(bot) {
    this.bot = bot;
    this.logger.info("Bot started!");
    this.bot.addEventHandler(
      (e) => new handleMessage(e, this),
      new NewMessage()
    );
  }
  async loadCommands() {
    const commands = fs.readdirSync(process.cwd() + "/commands/");
    for (let command of commands) {
      let cmd = await import("../commands/" + command);
      const c = new cmd.default(this);
      c.file = command;
      this.commands.set(c.opts.name, c);
      c.opts.aliases.forEach((x) => this.aliases.set(x, c.opts.name));
    }
    const size = this.commands.size;
    this.logger.info("Loaded a total of " + size + " commands");
  }
  async sendMessageAndDelete(message, opt, timeout) {
    let msg = await message.reply(opt);
    await this.utils.wait(timeout);
    msg.delete();
    return;
  }
  /**
   *
   * @param {*} chat
   * @returns {Player}
   */
  createPlayer(chat) {
    const player = new Player(this, chat);
    this.players.set(parseInt(chat), player);
    return player;
  }
}
