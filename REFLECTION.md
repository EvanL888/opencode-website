# Reflection

## Model and provider

I built this site with **Claude Code** (in the Claude desktop app) using **Claude Sonnet 5.5**
(`claude-sonnet-5-5`) from Anthropic, not OpenCode. The agent worked inside the cloned
`opencode-website` folder.

## One useful prompt

> make it a little bit more detailed though. it looks way to ai. Make the UI a little more unique and beautiful

My first version was a plain card layout with emoji icons. This prompt pushed the agent
to redesign it. The result: hand-drawn SVG plants instead of emoji, a day/night garden
scene, a seed-packet style form, three task stages (seed, sprout, bloom) and optional
harvest dates.

## One observed tool action

The agent used its Write tool to create `index.html`, `style.css` and `script.js`. It
then started a local server with `py -m http.server 8000 --bind 127.0.0.1` and ran
`curl` against `http://127.0.0.1:8000/`, which returned HTTP status `200`. It also ran
JavaScript in the browser pane to add sample tasks and read back the page state.

## One issue checked before and after

- Issue: the garden summary used the wrong plural for a count of one.
- Before: with one sprout and one bloom in the garden, the page said
  "3 seeds, 1 sprouts and 1 blooms in the ground." I saw this when checking the page
  in the browser.
- Change: I added a small `plural(n, word)` helper in `script.js` and used it for all
  three counts.
- After: the same data now reads "3 seeds, 1 sprout and 1 bloom in the ground."
  I confirmed this by reloading the page and reading the summary text.

## How the interaction works

Planting a task pushes an object `{id, text, energy, due, stage}` onto an array, saves
it to `localStorage`, and re-renders. Each task has a `stage` of 0 (seed), 1 (sprout) or
2 (bloom). The Water button adds one to the stage, wrapping back to 0 after bloom.
Both the list thumbnails and the garden scene are drawn by the same function,
which builds an SVG plant from the stage and the energy type, so flower shape and
color differ by energy. The filter buttons change a filter variable and re-render,
and the progress bar counts a sprout as half a plant and a bloom as a whole one. All
controls are real buttons, inputs and labels, so they work with the keyboard.
