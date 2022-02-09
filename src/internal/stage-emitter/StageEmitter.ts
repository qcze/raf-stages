export abstract class StageEmitter<Stage> {
  public abstract emit(stage: Stage): void
  public abstract time(): DOMHighResTimeStamp
}
