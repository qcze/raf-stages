import {
  StageEmitterMap
} from "#internal/stage-emitter/StageEmitterMap"

import {
  StageScheduler
} from "#internal/stage-scheduler/StageScheduler"

import type {
  StageMap
} from "#internal/types/StageMap"

import type {
  StageEmitter
} from "#internal/stage-emitter/StageEmitter"

const enum Status {
  Idle,
  Active,
  Scheduled
}

interface State<S extends Status> {
  readonly status: S
}

interface StateIdle extends State<Status.Idle> {}

interface StateActive extends State<Status.Active> {}

interface StateScheduled extends State<Status.Scheduled> {
  readonly handle: number
}

export type StageSchedulerAFParams<Stage> = {
  readonly caf: typeof cancelAnimationFrame
  readonly raf: typeof requestAnimationFrame
  readonly emit: StageSchedulerAFParamsEmit<Stage>
}

export type StageSchedulerAFParamsEmit<Stage> = {
  (emitter: StageEmitter<Stage>): void
}

const state_idle = (): StateIdle => {
  return {
    status: Status.Idle
  }
}

const state_active = (): StateActive => {
  return {
    status: Status.Active
  }
}

const state_scheduled = (handle: number): StateScheduled => {
  return {
    handle,

    status: Status.Scheduled
  }
}

export class StageSchedulerAF<Stage> extends StageScheduler<Stage> {
  #state:
    | StateIdle
    | StateActive
    | StateScheduled

  readonly #stagemap: StageMap<Stage>
  readonly #attachment: FrameRequestCallback
  readonly #params: StageSchedulerAFParams<Stage>

  public constructor(params: StageSchedulerAFParams<Stage>) {
    super()

    this.#params = params
    this.#stagemap = new Map()
    this.#state = state_idle()

    this.#attachment = time => {
      this.#state = state_active()

      this.#params.emit.call(
        null,
        new StageEmitterMap(this.#stagemap, time)
      )

      if (this.#stagemap.size === 0) {
        this.#state = state_idle()
      } else {
        this.#state = state_scheduled(
          this.#params.raf.call(null, this.#attachment)
        )
      }
    }
  }

  public override cancel(stage: Stage, cb: FrameRequestCallback): void {
    const cbset = this.#stagemap.get(stage)

    if (cbset) {
      const cb_deleted = cbset.delete(cb)

      if (cb_deleted && cbset.size === 0) {
        this.#stagemap.delete(stage)

        if (this.#stagemap.size === 0 && this.#state.status === Status.Scheduled) {
          this.#params.caf.call(null, this.#state.handle)

          this.#state = state_idle()
        }
      }
    }
  }

  public override request(stage: Stage, cb: FrameRequestCallback): void {
    {
      let cbset = this.#stagemap.get(stage)

      if (!cbset) {
        this.#stagemap.set(stage, cbset = new Set())
      }

      cbset.add(cb)
    }

    if (this.#state.status === Status.Idle) {
      this.#state = state_scheduled(
        this.#params.raf.call(null, this.#attachment)
      )
    }
  }
}
