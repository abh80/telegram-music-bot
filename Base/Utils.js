export default class Utils {
  async wait(timeout) {
    return new Promise((res, rej) => setTimeout(res, timeout));
  }
}
