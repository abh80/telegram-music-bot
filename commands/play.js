import Command from "./../Base/Command.js";
import { NewMessageEvent } from "telegram/events/index.js";
import { YouTube } from "youtube-sr";

export default class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: "play",
      aliases: ["p"],
      description: "Plays a song",
    });
  }
  /**
   *
   * @param {NewMessageEvent} m
   * @param {Array<string>} args
   */
  async run(m, args) {
    if (!m.message.chat?.callActive) {
      this.client.sendMessageAndDelete(
        m.message,
        {
          message: "❌ No active voice chat was found",
        },
        3000
      );
      return;
    }
    const query = args.join(" ");
    if (!query.trim()) {
      this.client.sendMessageAndDelete(
        m.message,
        {
          message: "❌ No query was provided",
        },
        3000
      );
      return;
    }
    let msg0 = await m.message.reply({
      message: "🔎 Looking for it... Hold on!",
    });
    const video = await YouTube.searchOne(query);
    msg0.delete();
    if (!video)
      return this.client.sendMessageAndDelete(
        m.message,
        { message: "Not found" },
        3000
      );
    let player = this.client.players.get(parseInt(m.chatId));
    if (!player) player = this.client.createPlayer(parseInt(m.chatId));
    player.enqueue(video, m.message.senderId);
  }
}
