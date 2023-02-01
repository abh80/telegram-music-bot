import { NewMessageEvent } from "telegram/events/index.js";
import Client from "../Base/Client.js";
/**
 *
 * @param {NewMessageEvent} evt
 * @param {Client} client
 */
export default function handleMessage(evt, client) {
  let prefix = "!";
  let text = evt.message.text;
  if (!text.startsWith(prefix)) return;
  text = text.slice(1);
  const message = text.split(" ");
  let cmd = message[0];
  message.shift();
  if (client.commands.get(cmd)) {
    let cmd1 = client.commands.get(cmd);
    if (cmd1?.opts.ownerOnly && evt.message.sender?.username != "Topic787")
      return client.sendMessageAndDelete(
        evt.message,
        {
          message: "Owner only command, cant execute",
        },
        3000
      );
    cmd1?.run(evt, message);
  } else if (client.aliases.get(cmd)) {
    let cmd1 = client.commands.get(client.aliases.get(cmd));
    if (cmd1?.opts.ownerOnly && evt.message.sender?.username != "Topic787")
      return client.sendMessageAndDelete(
        evt.message,
        {
          message: "Owner only command, cant execute",
        },
        3000
      );
    cmd1?.run(evt, message);
  }
}
