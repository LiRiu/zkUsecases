import { asmain } from "../../bundle-js/common/bundle_local.js";
// import { asmain } from "../build/demo_idx.js";

import { providers, utils } from "ethers";
import { getRawReceipts } from "../../bundle-js/common/ethers_helper.js";
import {
  TxReceipt,
  concatRawRlpList,
} from "../../bundle-js/common/tx_receipt.js";
import { fromHexString, toHexString } from "../../bundle-js/common/utils.js";
// usage: node exec.js <blocknum/blockhash>
//TODO: read args from input
//TODO: read blocknum/blockhash from one another
//TODO: read yaml -> source addr/esig
//TODO: block -> rawreceipts -> rlp -> filter -> matched_event_offsets

var rawreceipts = fromHexString(
  "02f9043a0183046276b9010000200000000000000000000080000000000000000000000000010000000000000000000000000001000000000000000002040000080000000000040000000000000000000000000000000008000000200000080000000000000000008000000004000000000000000000000000000000000000000000000000000010000000000000000000000000004000000000000000000001000000080000004000000000000000004000000000000000020100000000000000000000000000020000000000000002000000080000000000000000000000000000001020000000000020000000200000000080000000000000000000000000000000400000000000000000f9032ff87a94c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2f842a0e1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109ca00000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488da0000000000000000000000000000000000000000000000000016345785d8a0000f89b94c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2f863a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488da0000000000000000000000000c09fd65b483997d3a4b01e9e0f3c8560d0d91ff6a0000000000000000000000000000000000000000000000000016345785d8a0000f89b94d4cfb98837861216f1b51ca7368471c7a3d428abf863a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa0000000000000000000000000c09fd65b483997d3a4b01e9e0f3c8560d0d91ff6a0000000000000000000000000b4645d3702f52f0a610e1616c5c07b81a085bfffa0000000000000000000000000000000000000000000001e9bf47b130a5af20ff5f87994c09fd65b483997d3a4b01e9e0f3c8560d0d91ff6e1a01c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1b840000000000000000000000000000000000000000000000000e714ae4d320c454300000000000000000000000000000000000000000013d969429a7b93a3578f60f8fc94c09fd65b483997d3a4b01e9e0f3c8560d0d91ff6f863a0d78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822a00000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488da0000000000000000000000000b4645d3702f52f0a610e1616c5c07b81a085bfffb880000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001e9bf47b130a5af20ff5",
);
if (rawreceipts[0] == 0x02) {
  rawreceipts = rawreceipts.slice(1);
}
var matched_event_offsets = Uint32Array.from([
  711, 733, 0, 0, 0, 767, 64, 711, 733, 0, 0, 0, 767, 64,
]);
// console.log(rawreceipts)
// console.log(matched_event_offset, matched_event_offset.length)
var state = asmain(rawreceipts, matched_event_offsets);

console.log("[+] zkgraph output:", toHexString(state));
