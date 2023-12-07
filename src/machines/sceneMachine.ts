import { createMachine, ActorRefFrom } from "xstate";

export type SceneServiceRef = ActorRefFrom<typeof sceneMachine>;

export type SceneMachineEvent =
  | { type: "START_STORY" }
  | { type: "START_FREERUN" }
  | { type: "EXIT" };

export const sceneMachine = createMachine({
  id: "sceneMachine",
  types: {} as {
    events: SceneMachineEvent;
  },
  initial: "title",
  states: {
    title: {
      on: {
        START_STORY: {
          target: "story",
        },
        START_FREERUN: {
          target: "freerun",
        },
      },
    },
    story: {
      on: {
        EXIT: {
          target: "title",
        },
      },
    },
    freerun: {
      on: {
        EXIT: {
          target: "title",
        },
      },
    },
  },
});
