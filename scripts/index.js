import check from "./check.js";
import play from "./play.js";

try {
  check();
  play();
} catch (e) {
  console.error(e);
}
