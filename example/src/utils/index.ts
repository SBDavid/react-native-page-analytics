export default class Utils {
  static delay(duration: number) {
    return new Promise((resolve) => setTimeout(resolve, duration));
  }
}
