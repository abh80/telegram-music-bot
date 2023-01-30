import Command from "./../Base/Command.js";
import { NewMessageEvent } from "telegram/events/index.js";
import { YouTube } from "youtube-sr";

export default class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: "help",
      aliases: ["h"],
      description: "Shows this menu",
    });
  }
  /**
   *
   * @param {NewMessageEvent} m
   * @param {Array<string>} args
   */
  async run(m, args) {
    m.message.reply({
      message:
        "help Menu:- \nAll commands must start with **!**           \nEx: !play there for you\n\n" +
        Array.from(this.client.commands.values())
          .filter((x) => !x.opts.ownerOnly)
          .map((x) => `**${x.opts.name}** - ${x.opts.description}`).join("\n"),
    });
  }
}
