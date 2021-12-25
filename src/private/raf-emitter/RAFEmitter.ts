export abstract class RAFEmitter<Stage> {
  #active: boolean
  #handle: number | undefined

  readonly #tick: FrameRequestCallback
  readonly #stagemap: Map<Stage, Set<FrameRequestCallback>>

  public constructor() {
    this.#active = false
    this.#stagemap = new Map()

    this.#tick = time => {
      this.#active = true

      this._emit(time)

      this.#active = false

      // request another tick if there is callbacks scheduled
      if (this.#stagemap.size === 0) {
        this.#handle = void 0
      } else {
        this.#handle = this._raf(this.#tick)
      }
    }
  }

  /** cancel callback from stage */
  public cancel(stage: Stage, cb: FrameRequestCallback): void {
    const cbset = this.#stagemap.get(stage)

    if (cbset) {
      const cbset_deletion = cbset.delete(cb)

      // if cb deleted and cbset is empty - delete cbset from stagemap
      if (cbset_deletion && cbset.size === 0) {
        this.#stagemap.delete(stage)

        // cancel handle if stagemap is empty
        // do nothing if execution is active
        if (!this.#active && this.#handle && this.#stagemap.size === 0) {
          this._caf(this.#handle)

          this.#handle = void 0
        }
      }
    }
  }

  /** schedule callback for stage */
  public request(stage: Stage, cb: FrameRequestCallback): void {
    // add cb to stage
    {
      let cbset = this.#stagemap.get(stage)

      if (!cbset) {
        this.#stagemap.set(stage, cbset = new Set())
      }

      cbset.add(cb)
    }

    // request tick if not requested
    // do nothing if execution is active
    if (!(this.#active || this.#handle)) {
      this.#handle = this._raf(this.#tick)
    }
  }

  /** emits stages in order defined by `this._order` */
  protected _emit(time: number): void {
    for (const stage of this._order()) {
      this._emitstage(stage, time)
    }
  }

  /** clears stage and emit scheduled callbacks */
  protected _emitstage(stage: Stage, time: number): void {
    const cbset = this.#stagemap.get(stage)

    if (cbset) {
      // clear stage before emitting callbacks
      this.#stagemap.delete(stage)

      for (const cb of cbset) {
        cb(time)
      }
    }
  }

  /** cancelAnimationFrame */
  protected _caf(handle: number): void {
    cancelAnimationFrame(handle)
  }

  /** requestAnimationFrame */
  protected _raf(cb: FrameRequestCallback): number {
    return requestAnimationFrame(cb)
  }

  // abstract
  /** defines stages execution order */
  protected abstract _order(): Iterable<Stage>
}
