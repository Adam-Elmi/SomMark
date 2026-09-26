// ###################
// A [script = src] file: bundled into the page's JS, runs as a module
// ###################
const clock = document.getElementById("clock");
const tick = () => (clock.textContent = new Date().toLocaleTimeString());
tick();
setInterval(tick, 1000);
