# Seedlings

A todo list for people who like a bit of garden in their chores. Every task is a seed
in a packet. Pick how much "light" it needs (Marigold = quick, Poppy = steady,
Foxglove = deep) and an optional harvest date. Then water it: seed, sprout, bloom.
Your plot at the top of the page fills with hand-drawn plants as you make progress.

Audience: students juggling assignments. Everything is saved in your browser only.

## Prerequisites

- A web browser.
- Python 3 (for the local server). Check with `python --version` or `py --version`.

No packages to install.

## Run it locally

From the project folder:

```bash
python -m http.server 8000 --bind 127.0.0.1
```

On Windows, if `python` is not found, use:

```bash
py -m http.server 8000 --bind 127.0.0.1
```

Then open <http://localhost:8000> in your browser.

## Stop the server

Click the terminal running it and press `Ctrl+C`.

If port 8000 is busy, use `8001` in both the command and the URL.

## Using it

1. Fill in the seed packet and press **Put it in the ground**.
2. Press **Water it** on a task to move it from seed to sprout, then **Help it bloom**
   to finish it. A third press sends it back to seed.
3. Use **All / Seeds / Sprouts / Blooms** to filter the list.
4. **Switch to night** changes the theme. **Clear all blooms** removes finished tasks.
5. Tasks past their harvest date are marked "Overdue".

Everything works with `Tab`, `Space` and `Enter`.

## Files

- `index.html`: page structure
- `style.css`: layout, day and night themes, the garden scene
- `script.js`: task logic, SVG plant drawing, filtering, theme, saving
- `AGENTS.md`: constraints given to the coding agent
- `REFLECTION.md`: notes on working with the agent
