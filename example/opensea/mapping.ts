//@ts-ignore
import { Bytes, Event, BigInt } from "@hyperoracle/zkgraph-lib";
import { OrderFulfilled } from "./utils/parser";

export function handleEvents(events: Event[]): Bytes {
  let totalNftTradeAmount: BigInt = BigInt.zero();
  let totalEthTradeAmount: BigInt = BigInt.zero();

  for (let i = events.length - 1; i >= 0; i--) {
    const orderFulfilled = OrderFulfilled.fromEventData(events[i].data);
    totalNftTradeAmount = totalNftTradeAmount.plus(
      orderFulfilled.getTotalNftTradeAmount(),
    );
    totalEthTradeAmount = totalEthTradeAmount.plus(
      orderFulfilled.getTotalEthTradeAmount(),
    );
  }

  const totalNftTradeAmountBytes = Bytes.fromHexString(
    totalNftTradeAmount.toString(16),
  ).padStart(32, 0);
  const totalEthTradeAmountBytes = Bytes.fromHexString(
    totalEthTradeAmount.toString(16),
  ).padStart(32, 0);
  const totalTradeAmountBytes = totalNftTradeAmountBytes.concat(
    totalEthTradeAmountBytes,
  );
  return Bytes.fromByteArray(totalTradeAmountBytes);
}
