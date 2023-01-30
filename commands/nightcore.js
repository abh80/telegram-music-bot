import Command from "./../Base/Command.js";
import { NewMessageEvent } from "telegram/events/index.js";
import { YouTube } from "youtube-sr";

export default class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: "nightcore",
      aliases: ["nc"],
      description: "Nightcores a song",
    });
  }
  /**
   *
   * @param {NewMessageEvent} m
   * @param {Array<string>} args
   */
  async run(m, args) {

    if (!this.client.players.has(parseInt(m.message.chat?.id))) {
      this.client.sendMessageAndDelete(
        m.message,
        {
          message: "❌ No player is running in your voice chat",
        },
        3000
      );
      return;
    }
    let player = this.client.players.get(parseInt(m.message.chat?.id));
    if (player) {
      player.toggleNightcore();
    }
  }
}