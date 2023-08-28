//@ts-ignore
import { Bytes, Event, Address } from "@hyperoracle/zkgraph-lib";

export function handleEvents(events: Event[]): Bytes {
  for (let i = 0; i <= events.length - 1; i++) {
    const trade = Address.fromBytes(events[i].topic1);
  }
  return Bytes.empty();
}