export abstract class StageScheduler<Stage> {
  public abstract cancel(stage: Stage, cb: FrameRequestCallback): void
  public abstract request(stage: Stage, cb: FrameRequestCallback): void
}
