const io = require('socket.io-client');
const socket = io("wss://api.ridewithpals.com", {
  transports: ["websocket"]
});
socket.on("connect", () => {
  console.log("CONNECTED");
  process.exit(0);
});
socket.on("connect_error", (err) => {
  console.log("CONNECT_ERROR:", err.message);
  process.exit(1);
});
setTimeout(() => {
  console.log("TIMEOUT");
  process.exit(1);
}, 5000);
