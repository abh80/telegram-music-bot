import Ffmpeg from "fluent-ffmpeg";
import Client from "./../Client.js";
import { GramTGCalls, Stream } from "tgcalls-next";
import { Video } from "youtube-sr";
import ytdl from "ytdl-core";

export default class Player {
  /**
   *
   * @param {Client} client
   * @param {Chat} chat
   */
  constructor(client, chat) {
    this.chat = chat;
    this.chat_id = chat
    this.client = client;
    this.call = new GramTGCalls(client, this.chat_id);
    this.call.on("audio-finish", this.onAudioFinish.bind(this));
    this.call.on("call-discarded", this.destroy.bind(this));
    this.call.on("audio-error", this.destroy.bind(this));
    this.settings = {
      nightcore: false,
      bassboost: false,
    };
    this.queue = [];
  }
  /**
   *
   * @param {Video} video
   * @param {*} requester
   */
  enqueue(video, requester) {
    if (this.queue.length) {
      this.client.bot.sendMessage(this.chat, {
        message: `Succefully queued song **${video.title}** by **${video.channel?.name}**`,
      });
      this.queue.push(video);
      return;
    }
    this.queue.push(video);

    this.play();
  }

  play(ignore) {
    if (!this.queue.length) return this.destroy();
    let item = this.queue[0];
    const url = `https://www.youtube.com/watch?v=${item.id}`;
    const stream = ytdl(url, {
      filter: "audioonly",
      quality: "lowestaudio",
    });

    let audio = Ffmpeg(stream)
      .format("s16le")
      .audioFrequency(32000)
      .audioChannels(2);
    let filters = [];
    if (this.settings.nightcore) {
      filters.push("asetrate=60000");
      filters.push("aresample=48000");
    }
    audio.audioFilters(filters);
    audio.on("error", () => {});
    let output = audio.pipe();
    if (!ignore)
      this.client.bot.sendMessage(this.chat, {
        message: `Started playing track **${item.title}** by **${item.channel?.name}**`,
      });
    this.call.stream({ audio: output });
  }

  onAudioFinish() {
    this.queue.shift();
    if (!this.queue.length) return this.destroy();
    this.play();
  }
  toggleNightcore() {
    this.settings.nightcore = !this.settings.nightcore;
    this.play(true);
    this.client.bot.sendMessage(this.chat, {
      message: `${
        this.settings.nightcore ? "✅ Enabled" : "❌ Disabled"
      } nightcore!`,
    });
  }
  destroy() {
    this.call.stop();
    this.client.players.delete(parseInt(this.chat_id));
  }
}
