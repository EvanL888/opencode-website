# Reflection

> Fill in the TODO items yourself. They describe your own work with the agent.

## Model and provider

TODO: the model name shown in the OpenCode picker, and the provider.

## One useful prompt

TODO: paste one prompt you gave the agent that worked well.

## One observed tool action

TODO: a file the agent edited or a command it ran, and what came back.

## One issue checked before and after

- Issue: TODO (for example, "the summary said '1 sprouts'")
- Before: TODO (what you saw, and how you checked)
- Change: TODO
- After: TODO (what you saw after the change)

## How the interaction works

Planting a task pushes an object `{id, text, energy, due, stage}` onto an array, saves
it to `localStorage`, and re-renders. Each task has a `stage` of 0 (seed), 1 (sprout) or
2 (bloom). The Water button adds one to the stage, wrapping back to 0 after bloom.
Both the list thumbnails and the garden scene are drawn from the same function,
which builds an SVG plant from the stage and the energy type (so the flower shape and
color differ by energy). The filter buttons change a filter variable and re-render,
and the progress bar counts a sprout as half and a bloom as a full plant. All
controls are real buttons, inputs and labels, so they work with the keyboard.
