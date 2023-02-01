import Ffmpeg from "fluent-ffmpeg";
import Client from "./../Client.js";
import { GramTGCalls } from "tgcalls-next";
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
    this.chat_id = chat;
    this.client = client;
    this.call = new GramTGCalls(client, this.chat_id);
    this.call.on("audio-finish", this.onAudioFinish.bind(this));
    this.call.on("call-discarded", this.destroy.bind(this));
    this.call.on("audio-error", this.destroy.bind(this));
    this.djs = [];
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
    video.requester = requester;
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
  pause() {
    const f = this.call.pause();
    if (!f)
      return this.client.bot.sendMessage(this.chat_id, {
        message: "⏸️ Player is already paused",
      });
    else
      return this.client.bot.sendMessage(this.chat_id, {
        message: "⏸️ Player is paused",
      });
  }
  resume() {
    const f = this.call.resume();
    if (!f)
      return this.client.bot.sendMessage(this.chat_id, {
        message: "▶️ Player is already playing",
      });
    else
      return this.client.bot.sendMessage(this.chat_id, {
        message: "▶️ Player is playing now!",
      });
  }
  async play(ignore) {
    if (!this.queue.length) return this.destroy();
    let item = this.queue[0];
    if (item.requester) {
      item.requester = await this.client.bot.getEntity(item.requester);
    }
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
    audio.on("error", () => {
      audio.kill();
    });
    let output = audio.pipe();
    output.on("close", () => audio.kill());
    if (!ignore)
      this.client.bot.sendMessage(this.chat, {
        message: `Started playing track <b>${item.title}</b> by <b>${
          item.channel?.name
        }</b>\n\nRequested by: ${
          item.requester
            ? `<a href="tg://user?id=${parseInt(item.requester.id)}">${
                item.requester.firstName
              }</a>`
            : "Someone ig?"
        }`,
        parseMode: "html",
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
    this.call.removeAllListeners();
    this.client.players.delete(parseInt(this.chat_id));
  }
  async skip(user) {
    if (!this.queue.length) return "Something went wrong";
    if (this.queue.length <= 1) return "Nothing is queued next, cant skip";
    let isUserAdmin = this.djs.find((x) => parseInt(x) == parseInt(user));
    if (!isUserAdmin) {
      isUserAdmin = await this.client.utils.checkIfUserAdmin(
        this.chat_id,
        user,
        this.client
      );
      if (isUserAdmin) this.djs.push(user);
    }
    if (!isUserAdmin) {
      if (
        typeof this.queue[0]?.requester == "object" &&
        parseInt(this.queue[0].requester?.id) != parseInt(user)
      )
        return "Tracks can only be skipped by DJs or the ones who requested them";
      this._skip();
      return "Track will be skipped ⏩";
    }
    this._skip();
    return "Track will be skipped ⏩";
  }
  _skip() {
    this.onAudioFinish();
  }
  addDj(user) {
    this.djs.push(user)
  }
  async isDj(user) {
    let isUserAdmin = this.djs.find((x) => parseInt(x) == parseInt(user));
    if (!isUserAdmin) {
      isUserAdmin = await this.client.utils.checkIfUserAdmin(
        this.chat_id,
        user,
        this.client
      );
      if (isUserAdmin) this.djs.push(user);
    }
    return isUserAdmin != null;
  }
}
