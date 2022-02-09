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

export type StageSchedulerAttachmentParamsEmit<Stage> = {
  (emitter: StageEmitter<Stage>): void
}

export type StageSchedulerAttachmentParamsSrc<SrcStage> = {
  readonly stage: SrcStage
  readonly scheduler: StageScheduler<SrcStage>
}

export type StageSchedulerAttachmentParams<SrcStage, Stage> = {
  readonly emit: StageSchedulerAttachmentParamsEmit<Stage>
  readonly src: StageSchedulerAttachmentParamsSrc<SrcStage>
}

export class StageSchedulerAttachment<SrcStage, Stage> extends StageScheduler<Stage> {
  #status: Status

  readonly #stagemap: StageMap<Stage>
  readonly #attachment: FrameRequestCallback
  readonly #params: StageSchedulerAttachmentParams<SrcStage, Stage>

  public constructor(params: StageSchedulerAttachmentParams<SrcStage, Stage>) {
    super()

    this.#params = params
    this.#stagemap = new Map()
    this.#status = Status.Idle

    this.#attachment = time => {
      this.#status = Status.Active

      this.#params.emit.call(
        null,
        new StageEmitterMap(this.#stagemap, time)
      )

      if (this.#stagemap.size === 0) {
        this.#status = Status.Idle
      } else {
        this.#status = Status.Scheduled

        this.#params.src.scheduler.request(this.#params.src.stage, this.#attachment)
      }
    }
  }

  public override cancel(stage: Stage, cb: FrameRequestCallback): void {
    const cbset = this.#stagemap.get(stage)

    if (cbset) {
      const cb_deleted = cbset.delete(cb)

      if (cb_deleted && cbset.size === 0) {
        this.#stagemap.delete(stage)

        if (this.#stagemap.size === 0 && this.#status === Status.Scheduled) {
          this.#status = Status.Idle

          this.#params.src.scheduler.cancel(this.#params.src.stage, this.#attachment)
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

    if (this.#status === Status.Idle) {
      this.#status = Status.Scheduled

      this.#params.src.scheduler.request(this.#params.src.stage, this.#attachment)
    }
  }
}
