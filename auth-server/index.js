import { WebSocketServer } from "ws";
import NodeRSA from "node-rsa";
import input from "input";

const server = new WebSocketServer({ port: 8080 });

const key = new NodeRSA({ b: 512 });

const text = "abh80";
const encrypted = key.encrypt(text, "base64");

console.log("Your encryption key is : " + encrypted);

server.on("connection", (ws) => {
  ws.on("error", (e) => console.log("An error happened " + e.message));
  ws.send(JSON.stringify({ code: 1 }), { binary: false });
  ws.onmessage = async (m) => {
    let data = JSON.parse(m.data);
    if (data.code == 2 && data.key == encrypted) {
      ws.auth = true;
      console.log(
        "An verified websocket authentication connection was opened\n"
      );
      ws.send(JSON.stringify({ code: 3 }));
      return;
    }
    if (!ws.auth) {
      return ws.close();
    }
    if (data.code == 4) {
      let phone = await input.text("Enter your phone number: ");
      ws.send(JSON.stringify({ code: 5, phone }));
    }
    if (data.code == 6) {
      let phone = await input.text("Enter your verification code: ");
      ws.send(JSON.stringify({ code: 7, ver: phone }));
      console.log("Successfully granted authentication");
    }
  };
});
