/* A small sliding-tile puzzle: slide the letters to spell RAVEX. Stores nothing and sends nothing. */
(function () {
  var board = document.querySelector("[data-board]");
  if (!board) return;

  var COLS = 3;
  var LETTERS = ["R", "A", "V", "E", "X"];
  var statusEl = document.querySelector("[data-board-status]");
  var shuffleBtn = document.querySelector("[data-shuffle]");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var empty = { c: 2, r: 1 };
  var busy = false;
  var tiles = [];

  // six background slots so the board keeps its shape
  for (var s = 0; s < 6; s++) {
    var slot = document.createElement("div");
    slot.className = "slot";
    slot.setAttribute("aria-hidden", "true");
    board.appendChild(slot);
  }

  LETTERS.forEach(function (letter, i) {
    var el = document.createElement("button");
    el.type = "button";
    el.className = "tile";
    el.textContent = letter;
    el.setAttribute("data-letter", letter);
    el.setAttribute("aria-label", "Tile " + letter);
    var t = { el: el, c: i % COLS, r: Math.floor(i / COLS), homeC: i % COLS, homeR: Math.floor(i / COLS) };
    el.addEventListener("click", function () { if (!busy && move(t)) updateStatus(); });
    board.appendChild(el);
    tiles.push(t);
  });

  function adjacent(t) { return Math.abs(t.c - empty.c) + Math.abs(t.r - empty.r) === 1; }

  function place(t) {
    t.el.style.setProperty("--c", t.c);
    t.el.style.setProperty("--r", t.r);
  }

  function refresh() {
    tiles.forEach(function (t) {
      var can = adjacent(t);
      t.el.classList.toggle("is-movable", can);
      t.el.tabIndex = can ? 0 : -1;
      t.el.setAttribute("aria-disabled", can ? "false" : "true");
      place(t);
    });
  }

  function move(t) {
    if (!adjacent(t)) return false;
    var oc = t.c, or = t.r;
    t.c = empty.c; t.r = empty.r;
    empty.c = oc; empty.r = or;
    refresh();
    return true;
  }

  function solved() {
    return tiles.every(function (t) { return t.c === t.homeC && t.r === t.homeR; });
  }

  function say(text) { if (statusEl) statusEl.textContent = text; }

  // Announce only when something worth hearing changes: solved, or back to unsolved.
  function updateStatus() {
    if (solved()) say("Solved. Nice work.");
    else if (statusEl && statusEl.textContent.indexOf("Solved") === 0) say("Slide the tiles to spell RAVEX.");
  }

  function shuffle() {
    if (busy) return;
    busy = true;
    board.classList.add("is-shuffling");
    var steps = 28, last = null;

    function step() {
      var options = tiles.filter(function (t) { return adjacent(t) && t !== last; });
      var pick = options[Math.floor(Math.random() * options.length)];
      last = pick;
      move(pick);
      steps--;
      if (steps > 0 || solved()) {
        if (reduceMotion) { step(); } else { setTimeout(step, 70); }
      } else {
        board.classList.remove("is-shuffling");
        busy = false;
        say("Shuffled. Slide the tiles to spell RAVEX again.");
      }
    }
    step();
  }

  if (shuffleBtn) shuffleBtn.addEventListener("click", shuffle);
  refresh();
})();
