import Client from "./Client.js";

export default class Command {
  /**
   *
   * @param {Client} client
   * @param {Object} opts
   */
  constructor(
    client,
    opts = {
      name: null,
      description: "no description",
      aliases: [],
      permissions: [],
      ownerOnly: false,
    }
  ) {
    this.client = client;
    this.opts = opts;
  }
}
