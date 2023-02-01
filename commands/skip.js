import Command from "./../Base/Command.js";
import { NewMessageEvent } from "telegram/events/index.js";

export default class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: "skip",
      aliases: ["s"],
      description: "Skips a song",
    });
  }
  /**
   *
   * @param {NewMessageEvent} m
   * @param {Array<string>} args
   */
  async run(m, args) {
    if (!this.client.players.has(parseInt(m.chatId))) {
      this.client.sendMessageAndDelete(
        m.message,
        {
          message: "❌ No player is running in your voice chat",
        },
        3000
      );
      return;
    }
    let player = this.client.players.get(parseInt(m.chatId));
    if (player) {
      const res = await player.skip(m.message.senderId);
      this.client.sendMessageAndDelete(m.message, { message: res }, 3000);
    }
  }
}
