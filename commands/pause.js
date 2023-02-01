import Command from "./../Base/Command.js";
import { NewMessageEvent } from "telegram/events/index.js";
import { YouTube } from "youtube-sr";

export default class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: "pause",
      aliases: ["ps"],
      description: "Pauses a song",
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
      player.pause();
    }
  }
}
