# raf-stages

Coordinate `requestAnimationFrame` calls

## Usage

- Create instance of `RAFEmitter`
- Emitter is idle when no callback scheduled

```ts
// src/emitter.ts

export enum Stage {
  Update,
  Effect
}

class RAFEmitterExample extends RAFEmitter<Stage> {
  // override _order method to define stage execution order
  protected override *_order(): IterableIterator<Stage> {
    yield Stage.Update
    yield Stage.Effect
  }
}

export const emitter = new RAFEmitterExample()
```

- Schedule callbacks for stage with `request` method
- Cancel callbacks from stage with `cancel` method
- Callbacks scheduled for stage are unique
- Callback is a `FrameRequestCallback` (the same as you pass to `requestAnimationFrame`)

```ts
// src/state.ts

import { Stage, emitter } from './emitter'

function update(time: number): void {
  // ...
}

function effect(time: number): void {
  // ...
}

function update_tick(update_time: number): void {
  // ...

  // will schedule update_tick for next animation frame so it will run continuosly
  emitter.request(Stage.Update, update_tick)

  // but this will emit in current animation frame
  emitter.request(Stage.Effect, effect_time => {
    console.log(update_time === effect_time) // true
  })
}

// will emit effect after update and update_tick in next animation frame
emitter.request(Stage.Update, update)
emitter.request(Stage.Effect, effect)
emitter.request(Stage.Update, update_tick)

// no effect, update already scheduled
emitter.request(Stage.Update, update)

// cancel update_tick
emitter.cancel(Stage.Update, update_tick)
```

- Override `_raf` and `_caf` methods to provide custom `requestAnimationFrame` and `cancelAnimationFrame` eg. to polyfill

```ts
import rafpolyfill from 'example-polyfill'

class RAFEmitterPolyfilled extends RAFEmitter<Stage> {
  protected override _caf(handle: number): void {
    rafpolyfill.cancelAnimationFrame(cb)
  }

  protected override _raf(cb: FrameRequestCallback): number {
    return rafpolyfill.requestAnimationFrame(cb)
  }
}
```

- Override `_emit` and `_emitstage` methods to wrap execution eg. to batch updates

```ts
import { unstable_batchedUpdates } from 'react-dom'

enum Stage {
  Update,
  Effect
}

class RAFEmitterBatched extends RAFEmitter<Stage> {
  protected override _emit(time: number): void {
    // batch all stages
    unstable_batchedUpdates(() => {
      super._emit(time)
    })
  }

  protected override _emitstage(stage: Stage, time: numbere): void {
    // batch Stage.Effect only
    switch (stage) {
      case Stage.Effect:
        unstable_batchedUpdates(() => {
          super._emitstage(stage, time)
        })

        break

      default:
        super._emitstage(stage, time)

        break
    }
  }
}
```

## API

```ts
abstract class RAFEmitter<Stage> {
  // cancel callback from stage
  public cancel(stage: Stage, cb: FrameRequestCallback): void
  // schedule callback for stage
  public request(stage: Stage, cb: FrameRequestCallback): void

  // cancelAnimationFrame
  protected _caf(handle: number): void
  // requestAnimationFrame
  protected _raf(cb: FrameRequestCallback): number

  // emits all stages in _order
  protected _emit(time: number): void
  // clears and emits given stage
  protected _emitstage(stage: Stage, time: number): void

  // defines exectuion order
  protected abstract _order(): IterableIterator<Stage>
}
```
