import { clamp, floatEqual } from "@rewind/osu/math";
import { SliderCheckPointDescriptor } from "./SliderCheckPointDescriptor";
import { SliderCheckPointType } from "../SliderCheckPoint";

function* generateTicks(
  spanIndex: number,
  spanStartTime: number,
  spanDuration: number,
  reversed: boolean,
  length: number,
  tickDistance: number,
  minDistanceFromEnd: number,
): IterableIterator<SliderCheckPointDescriptor> {
  for (let d = tickDistance; d <= length; d += tickDistance) {
    if (d >= length - minDistanceFromEnd) {
      break;
    }
    const pathProgress = d / length;
    const timeProgress = reversed ? 1.0 - pathProgress : pathProgress;
    yield {
      type: SliderCheckPointType.TICK,
      spanIndex,
      spanStartTime,
      time: spanStartTime + timeProgress * spanDuration,
      pathProgress,
    };
  }
}

export function* generateSliderCheckpoints(
  startTime: number,
  spanDuration: number,
  velocity: number,
  tickDistance: number,
  totalDistance: number,
  spanCount: number,
  legacyLastTickOffset?: number,
): IterableIterator<SliderCheckPointDescriptor> {
  const length = Math.min(100000.0, totalDistance);
  tickDistance = clamp(tickDistance, 0.0, length);
  const minDistanceFromEnd = velocity * 10.0;

  // Generating ticks, repeats
  if (!floatEqual(tickDistance, 0.0)) {
    for (let span = 0; span < spanCount; span++) {
      const spanStartTime = startTime + span * spanDuration;
      const reversed: boolean = span % 2 === 1;

      const it = generateTicks(span, spanStartTime, spanDuration, reversed, length, tickDistance, minDistanceFromEnd);

      // Don't flame me for this
      const ticks = [];
      for (const t of it) ticks.push(t);
      if (reversed) ticks.reverse();
      for (const t of ticks) yield t;

      if (span < spanCount - 1) {
        yield {
          type: SliderCheckPointType.REPEAT,
          spanIndex: span,
          spanStartTime,
          time: spanStartTime + spanDuration,
          pathProgress: (span + 1) % 2,
        };
      }
    }
  }

  const totalDuration = spanCount * spanDuration;
  const finalSpanIndex = spanCount - 1;
  const finalSpanStartTime = startTime + finalSpanIndex * spanDuration;
  const finalSpanEndTime = Math.max(
    startTime + totalDuration / 2.0,
    finalSpanStartTime + spanDuration - (legacyLastTickOffset ?? 0),
  );
  let finalProgress = (finalSpanEndTime - finalSpanStartTime) / spanDuration;
  if (spanCount % 2 === 0) finalProgress = 1.0 - finalProgress;
  yield {
    type: SliderCheckPointType.LAST_LEGACY_TICK,
    spanIndex: finalSpanIndex,
    spanStartTime: finalSpanStartTime,
    time: finalSpanEndTime,
    pathProgress: finalProgress,
  };

  // Technically speaking the tail has no real relevancy for gameplay, it is just a visual element.
  // In Slider.cs it is even ignored...

  // yield {
  //   type: SliderCheckPointType.TAIL,
  //   spanIndex: finalSpanIndex,
  //   spanStartTime: startTime + (spanCount - 1) * spanDuration,
  //   time: startTime + totalDuration,
  //   pathProgress: spanCount % 2
  // };
}