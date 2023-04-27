export default function check() {
  if (!('indexedDB' in window)) {
    throw new Error("This browser doesn't support IndexedDB");
  }
  console.log("This browser supports IndexedDB!");
}
