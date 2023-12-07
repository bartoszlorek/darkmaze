import { createMachine, ActorRefFrom } from "xstate";

export type StoryServiceRef = ActorRefFrom<typeof storyMachine>;

export type StoryMachineEvent =
  | { type: "RESTART" }
  | { type: "DIE" }
  | { type: "WIN" };

export const storyMachine = createMachine({
  id: "storyMachine",
  types: {} as {
    events: StoryMachineEvent;
  },
  initial: "running",
  states: {
    running: {
      on: {
        RESTART: {
          target: "running",
        },
        DIE: {
          target: "dead",
        },
        WIN: {
          target: "win",
        },
      },
    },
    dead: {
      on: {
        RESTART: {
          target: "running",
        },
      },
    },
    win: {
      on: {
        RESTART: {
          target: "running",
        },
      },
    },
  },
});
