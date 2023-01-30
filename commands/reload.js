import Command from "./../Base/Command.js";
import { NewMessageEvent } from "telegram/events/index.js";
import path from "path";

export default class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: "reload",
      aliases: [],
      description: "Reloads a command",
      ownerOnly: true,
    });
  }
  /**
   *
   * @param {NewMessageEvent} m
   * @param {Array<string>} args
   */
  async run(m, args) {
    const command = this.client.commands.get(args[0]);
    if (!command)
      return this.client.sendMessageAndDelete(
        m.message,
        {
          message: "❌ No command with such name was found",
        },
        3000
      );
    this.client.commands.delete(args[0]);
    const ext = path.extname(command.file);
    const cmd = await import(
      "../commands/" + command.file + "?version=" + Math.random() + ext
    );
    let c = new cmd.default(this.client);
    c.file = command.file;
    this.client.commands.set(args[0], c);
    return this.client.sendMessageAndDelete(
      m.message,
      {
        message: "✅ Succesfully reloaded the command",
      },
      3000
    );
  }
}
