//@ts-ignore
import { Bytes, Event, BigInt } from "@hyperoracle/zkgraph-lib";
import { Trade } from "./utils/parser";

export function handleEvents(events: Event[]): Bytes {
  let totalTradeAmount: BigInt = BigInt.zero();

  for (let i = 0; i <= events.length - 1; i++) {
    const event = events[i];
    const trade = Trade.fromEvent(event);
    totalTradeAmount = totalTradeAmount.plus(trade.value);
  }

  const totalTradeAmountBytes = Bytes.fromHexString(
    totalTradeAmount.toString(16),
  ).padStart(32, 0);
  return totalTradeAmountBytes;
}
