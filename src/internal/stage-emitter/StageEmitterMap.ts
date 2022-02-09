import {
  StageEmitter
} from "#internal/stage-emitter/StageEmitter"

import type {
  StageMap
} from "#internal/types/StageMap"

export class StageEmitterMap<Stage> extends StageEmitter<Stage> {
  readonly #time: DOMHighResTimeStamp
  readonly #stagemap: StageMap<Stage>

  public constructor(stagemap: StageMap<Stage>, time: DOMHighResTimeStamp) {
    super()

    this.#time = time
    this.#stagemap = stagemap
  }

  public override emit(stage: Stage): void {
    const cbset = this.#stagemap.get(stage)

    if (cbset) {
      this.#stagemap.delete(stage)

      cbset.forEach(cb => {
        cb(this.#time)
      })
    }
  }

  public override time(): DOMHighResTimeStamp {
    return this.#time
  }
}
