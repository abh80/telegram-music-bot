import { Api } from "telegram";
import Client from "./Client.js";

export default class Utils {
  async wait(timeout) {
    return new Promise((res, rej) => setTimeout(res, timeout));
  }
  /**
   *
   * @param {*} channel
   * @param {*} user
   * @param {Client} client
   * @returns {boolean}
   */
  async checkIfUserAdmin(channel, user, client) {
    try {
      let res = await client.invoke(
        new Api.channels.GetParticipant({ channel, participant: user })
      );
      if (res.participant.className == "ChannelParticipantAdmin" || res.participant.className == "ChannelParticipantCreator" ) return true;
      else return false;
    } catch (e) {
      console.error(e)
      return false;
    }
  }
}
