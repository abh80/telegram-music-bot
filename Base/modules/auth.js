import { EventEmitter } from "events";
import WebSocket from "ws";
export default class Auth extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
  }
  async connect(url) {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);
      this.ws.once("open", () => {
        console.log("Socket to auth server opened!");
      });

      this.ws.on("error", (e) => console.error("[this.ws ERROR] " + e.message));
      this.ws.on("close", () => console.log("Socket closed"));
      this.ws.onmessage = (msg) => {
        resolve();
        this.onmessage(msg);
      };
    });
  }
  onmessage(msg) {
    let data = JSON.parse(msg.data);
    if (data.code == 1) {
      this.ws.send(JSON.stringify({ code: 2, key: process.env.auth_key }));
    }
    this.emit("msg", data);
  }
  closeSocket() {
    this.ws.close();
  }
  async getPhoneCode() {
    return new Promise((resolve, reject) => {
      this.ws.send(JSON.stringify({ code: 4 }));
      this.on("msg", (data) => {
        if (data.code == 5) {
          if (!data.phone) {
            console.error("[WSS auth] no phone was provided");
            ws.send(JSON.stringify({ code: 4 }));
          } else return resolve(data.phone);
        }
      });
    });
  }
  async getCode() {
    return new Promise((resolve, reject) => {
      this.ws.send(JSON.stringify({ code: 6 }));
      this.on("msg", (data) => {
        if (data.code == 7) {
          if (!data.ver) {
            console.error("[WSS auth] no code was provided");
            ws.send(JSON.stringify({ code: 6 }));
          } else {
            console.log(data.ver)
            return resolve(data.ver);
          }
        }
      });
    });
  }
}
