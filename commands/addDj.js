import { message } from "telegram/client/index.js";
import Command from "./../Base/Command.js";
import { NewMessageEvent } from "telegram/events/index.js";
import { YouTube } from "youtube-sr";
import { Api } from "telegram";

export default class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: "adddj",
      aliases: ["adj", "aj", "dj"],
      description: "Adds DJ to current session",
    });
  }
  /**
   *
   * @param {NewMessageEvent} m
   * @param {Array<satring>} args
   */
  async run(m, args) {
    if (!m.message.replyToMsgId)
      return this.client.sendMessageAndDelete(
        m.message,
        {
          message:
            "❌ Reply to a message sent by the person you want to be a DJ\n\nP.S Group Admins are already DJ, no need to define them again!",
        },
        5000
      );

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
      const dj = await player.isDj(m.message.senderId);
      if (!dj) {
        return this.client.sendMessageAndDelete(
          m.message,
          {
            message: "❌ Only admins or exisisting DJ's can use this command",
          },
          5000
        );
      }
    }
    try {
      const res = await this.client.invoke(
        new Api.channels.GetMessages({
          channel: m.chatId,
          id: [m.message.replyToMsgId],
        })
      );
      if (res.messages[0].fromBotId)
        return this.client.sendMessageAndDelete(
          m.message,
          {
            message: "Bots have no music taste 😏",
          },
          5000
        );
      player.addDj(res.messages[0].fromId);
      return this.client.sendMessageAndDelete(
        m.message,
        {
          message:
            "🎵 Successfully made them a DJ",
        },
        5000
      );
    } catch (e) {
      console.error(e);
      return this.client.sendMessageAndDelete(
        m.message,
        {
          message:
            "❌ A fatal error occurred by performing the task, please try again later",
        },
        5000
      );
    }
  }
}
