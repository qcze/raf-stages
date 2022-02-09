# raf-stages

Coordinate `requestAnimationFrame` calls

## Compatibility Warning

This library is targeted to `ECMAScript2021` (may be changed for later spec in further major versions)\
If you want to transpile it for earlier `ECMAScript` spec - do it yourself

## Usage

### Create scheduler

- schedulers are passive: they do not run requestAnimationFrame if no callbacks scheduled

```ts
import {
  StageSchedulerAF,

  type StageEmitter
} from "@qcz/raf-stages"

enum SchedulerStage {
  Update,
  Effect
}

const scheduler = new StageSchedulerAF<SchedulerStage>({
  // you can pass your own requestAnimationFrame and cancelAnimationFrame
  caf: cancelAnimationFrame,
  raf: requestAnimationFrame,

  // you can perform batching by wrapping emitter.emit calls
  emit: (emitter: StageEmitter<SchedulerStage>) => {
    emitter.emit(SchedulerStage.Update)
    emitter.emit(SchedulerStage.Effect)
  }
})
```

### Request and cancel callbacks

- callback is `FrameRequestCallback` (the same you pass to `requestAnimationFrame`)
- callbacks scheduled for stage are unique

```ts
const update: FrameRequestCallback = function (time) {
  // ...
}

const effect: FrameRequestCallback = function (time) {
  // ...
}

// update will be called before effect on next animation frame
scheduler.request(SchedulerStage.Effect, effect)
scheduler.request(SchedulerStage.Update, update)

// you can cancel callback scheduled for stage
scheduler.cancel(SchedulerStage.Effect, effect)

// create update loop
const updateloop: FrameRequestCallback = function (update_time) {
  // ...

  // will schedule callback for next animation frame
  scheduler.request(SchedulerStage.Update, updateloop)

  // will schedule callback for current animation frame because Effect stage emits after Update stage
  scheduler.request(SchedulerStage.Effect, effect_time => {
    // expected output: true
    console.log(update_time === effect_time)
  })
}

// init update loop
scheduler.request(SchedulerStage.Update, updateloop)
```

### Create attachment to scheduler

- note that stages in attachment are only sequenced locally

```ts
import {
  StageSchedulerAttachment
} from "@qcz/raf-stages"

enum AttachmentStage {
  Pre,
  Post
}

const attachment = new StageSchedulerAttachment<SchedulerStage.Update, AttachmentStage>({
  // attach to SchedulerStage.Update of scheduler
  src: {
    scheduler: scheduler,
    stage: SchedulerStage.Update
  },

  emit: emitter => {
    emitter.emit(AttachmentStage.Pre)
    emitter.emit(AttachmentStage.Post)
  }
})

const pre: FrameRequestCallback = function (time) {
  // ...
}

const post: FrameRequestCallback = function (time) {
  // ...
}

const update: FrameRequestCallback = function (time) {
  // ...
}

// callbacks will be called in following order: update - pre - post
scheduler.request(SchedulerStage.Update, update)
attachment.reqeust(AttachmentStage.Post, post)
attachment.request(AttachmentStage.Pre, pre)
```
