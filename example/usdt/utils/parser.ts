// @ts-ignore
import { Event, BigInt, Bytes } from "@hyperoracle/zkgraph-lib";

export class Trade {
  public from: Bytes;
  public to: Bytes;
  public value: BigInt;

  constructor(from: Bytes, to: Bytes, value: BigInt) {
    this.from = from;
    this.to = to;
    this.value = value;
  }

  static fromEvent(event: Event): Trade {
    const from = event.topic1;
    const to = event.topic2;
    const value = BigInt.fromBytesBigEndian(event.data.slice(0, 32));

    return new Trade(from, to, value);
  }
}