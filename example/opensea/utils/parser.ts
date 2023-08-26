// @ts-ignore
import { require } from "@hyperoracle/zkgraph-lib";
import { Bytes, BigInt } from "@hyperoracle/zkgraph-lib";

const OFFERS_OFFSET = BigInt.fromU64(0x80);
const CONSIDERATIONS_OFFSET = BigInt.fromU64(0x120);
const SINGLE_OFFER_DATA_SIZE = BigInt.fromU64(32).times(4);
const SINGLE_CONSIDERATION_DATA_SIZE = BigInt.fromU64(32).times(5);
const SEAPORT_FEE_RECIPIENT = Bytes.fromHexString("0x0000a26b00c1f0df003000390027140000faa719");

// reference link:
// https://etherscan.io/address/0x00000000000000adc04c56bf30ac9d3c0aaf14dc#code#F9#L115
enum ItemType {
  NATIVE,
  ERC20,
  ERC721,
  ERC1155,
  ERC721_WITH_CRITERIA,
  ERC1155_WITH_CRITERIA,
}

/**
 * Retrieves the itemType from a byte array.
 *
 * @param {Bytes} bytes - The byte array from which to retrieve the item type.
 * @return {ItemType} The corresponding item type based on the byte array.
 */
function itemTypeFromBytes(bytes: Bytes): ItemType {
  const itemType = BigInt.fromBytesBigEndian(bytes).toU32();

  switch (itemType) {
    case 0:
      return ItemType.NATIVE;
    case 1:
      return ItemType.ERC20;
    case 2:
      return ItemType.ERC721;
    case 3:
      return ItemType.ERC1155;
    case 4:
      return ItemType.ERC721_WITH_CRITERIA;
    case 5:
      return ItemType.ERC1155_WITH_CRITERIA;
    default:
      // Other item types are not allowed at the moment.
      // If an uncommon item type is found,
      // it should be understood as a parsing error in the event structure.
      require(false);
      return ItemType.NATIVE;
  }
}

/** reference link:
 * https://etherscan.io/address/0x00000000000000adc04c56bf30ac9d3c0aaf14dc#code#F7#L49
 * In the source code, there are variables called endAmount and startAmount,
 * but in the actual blockchain events, there is only a variable called amount.
 */
class OfferItem {
  public itemType: ItemType;
  public token: Bytes;
  public identifierOrCriteria: BigInt;
  public amount: BigInt;

  public constructor(
    itemType: ItemType,
    token: Bytes,
    identifierOrCriteria: BigInt,
    amount: BigInt
  ) {
    this.itemType = itemType;
    this.token = token;
    this.identifierOrCriteria = identifierOrCriteria;
    this.amount = amount;
  }

  /**
   * Creates an instance of OfferItem from the given offer data.
   *
   * @param {Bytes} data - The offer data.
   * @return {OfferItem} The created OfferItem instance.
   */
  static fromOfferData(data: Bytes): OfferItem {
    const itemTypeSlice = data.slice(0, 32);
    const token = data.slice(32, 64);
    const identifierOrCriteriaSlice = data.slice(64, 96);
    const amountSlice = data.slice(96, 128);

    const itemType: ItemType = itemTypeFromBytes(itemTypeSlice);
    const identifierOrCriteria = BigInt.fromBytesBigEndian(
      identifierOrCriteriaSlice
    );
    const amount = BigInt.fromBytesBigEndian(amountSlice);

    return new OfferItem(itemType, token, identifierOrCriteria, amount);
  }
}

/**
 * Generates a list of `OfferItem` objects from the given `data`.
 *
 * @param {Bytes} data - The data from offers slice in `Event.data`.
 * @return {OfferItem[]} - An array of `OfferItem` objects.
 */
function offerItemsFromData(data: Bytes): OfferItem[] {
  const offersLengthSlice = data.slice(0, 32);
  const offersLength = BigInt.fromBytesBigEndian(offersLengthSlice);
  const offersDataSize = SINGLE_OFFER_DATA_SIZE.times(offersLength);
  const offersData = data.slice(32, offersDataSize.plus(32).toI32());

  // TODO: Do we need to add a check here
  // for offersOffset + offersDataSize + 32 == considerationsOffset
  let offers: OfferItem[] = [];
  for (let i = 0; i < offersLength.toI32(); i++) {
    const offerDataStartOffset = i * SINGLE_OFFER_DATA_SIZE.toI32();
    const offerDataEndOffset = (i + 1) * SINGLE_OFFER_DATA_SIZE.toI32();

    const offerData = offersData.slice(
      offerDataStartOffset,
      offerDataEndOffset
    );
    const offer = OfferItem.fromOfferData(offerData);
    offers.push(offer);
  }
  return offers;
}

// reference link:
// https://etherscan.io/address/0x00000000000000adc04c56bf30ac9d3c0aaf14dc#code#F7#L62
// The Consideration and OfferItem are the same, only has the amount,
// without distinguishing between endAmount and startAmount.
class Consideration {
  public itemType: ItemType;
  public token: Bytes;
  public identifierOrCriteria: BigInt;
  public amount: BigInt;
  public recipient: Bytes;

  public constructor(
    itemType: ItemType,
    token: Bytes,
    identifierOrCriteria: BigInt,
    amount: BigInt,
    receipient: Bytes
  ) {
    this.itemType = itemType;
    this.token = token;
    this.identifierOrCriteria = identifierOrCriteria;
    this.amount = amount;
    this.recipient = receipient;
  }

  /**
   * Creates a `Consideration` instance from the given consideration data.
   *
   * @param {Bytes} data - The consideration data to create the instance from.
   * @return {Consideration} The created `Consideration` instance.
   */
  static fromConsiderationData(data: Bytes): Consideration {
    const itemTypeSlice = data.slice(0, 32);
    const token = data.slice(32, 64);
    const identifierOrCriteriaSlice = data.slice(64, 96);
    const amountSlice = data.slice(96, 128);
    const recipient = data.slice(128, 160);

    const itemType: ItemType = itemTypeFromBytes(itemTypeSlice);
    const identifierOrCriteria = BigInt.fromBytesBigEndian(
      identifierOrCriteriaSlice
    );
    const amount = BigInt.fromBytesBigEndian(amountSlice);

    return new Consideration(
      itemType,
      token,
      identifierOrCriteria,
      amount,
      recipient
    );
  }
}

/**
 * Generates the array of considerations from the given data.
 *
 * @param {Bytes} data - The considerations slice in `Event.data`.
 * @return {Consideration[]} An array of considerations.
 */
function considerationsFromData(data: Bytes): Consideration[] {
  const considerationsLengthSlice = data.slice(0, 32);
  const considerationsLength = BigInt.fromBytesBigEndian(
    considerationsLengthSlice
  );
  const considerationsDataSize =
    SINGLE_CONSIDERATION_DATA_SIZE.times(considerationsLength);
  const considerationsData = data.slice(
    32,
    considerationsDataSize.plus(32).toI32()
  );

  let considerations: Consideration[] = [];
  for (let i = 0; i < considerationsLength.toI32(); i++) {
    const considerationDataStartOffset =
      i * SINGLE_CONSIDERATION_DATA_SIZE.toI32();
    const considerationDataEndOffset =
      (i + 1) * SINGLE_CONSIDERATION_DATA_SIZE.toI32();
    const considerationData = considerationsData.slice(
      considerationDataStartOffset,
      considerationDataEndOffset
    );
    const consideration =
      Consideration.fromConsiderationData(considerationData);
    considerations.push(consideration);
  }
  return considerations;
}

export class OrderFulfilled {
  public orderHash: Bytes;
  public recipient: Bytes;
  public offers: OfferItem[];
  public offersLength: i32;
  public considerations: Consideration[];
  public considerationsLength: i32;

  public constructor(
    orderHash: Bytes,
    recipient: Bytes,
    offers: OfferItem[],
    considerations: Consideration[]
  ) {
    this.orderHash = orderHash;
    this.recipient = recipient;
    this.offers = offers;
    this.offersLength = offers.length;
    this.considerations = considerations;
    this.considerationsLength = considerations.length;
  }

  /**
   * Converts the given event data into an OrderFulfilled object.
   *
   * @param {Bytes} data - The event.data to convert.
   * @return {OrderFulfilled | null} - The converted OrderFulfilled object, or null if the conversion fails.
   */
  static fromEventData(data: Bytes): OrderFulfilled {
    const orderHash = data.slice(0, 32);
    const recipient = data.slice(32, 32 + 32);
    const offersOffsetSlice = data.slice(64, 64 + 32);
    const considerationsOffsetSlice = data.slice(96, 96 + 32);

    const offersOffset = BigInt.fromBytesBigEndian(offersOffsetSlice);
    const considerationsOffset = BigInt.fromBytesBigEndian(
      considerationsOffsetSlice
    );

    /*
     * The fields before "offers" are all of static type,
     * and the assertion here should always be true.
     */
    require(offersOffset === OFFERS_OFFSET);

    /* The offset of the "consideration" field depends on the length of the offer.
     * Currently, all encountered event offers have a length of 1.
     * Consider scenarios where the length of the offer is greater than one.
     */
    require(considerationsOffset === CONSIDERATIONS_OFFSET);

    const offersData = data.slice(
      offersOffset.toU32(),
      considerationsOffset.toU32()
    );
    const offers: OfferItem[] = offerItemsFromData(offersData);

    const considerationsData = data.slice(considerationsOffset.toU32());
    const considerations: Consideration[] =
      considerationsFromData(considerationsData);

    return new OrderFulfilled(orderHash, recipient, offers, considerations);
  }

  /**
   * Calculates the total NFT trade amount.
   *
   * @return {BigInt} The total NFT trade amount.
   */
  getTotalNftTradeAmount(): BigInt {
    let totalNftTradeAmount = BigInt.zero();
    for (let i = 0; i < this.offersLength; i++) {
      const NftTradeAmount = this.offers[i].amount;
      totalNftTradeAmount = totalNftTradeAmount.plus(NftTradeAmount);
    }
    return totalNftTradeAmount;
  }

  /**
   * Calculates the total Ethereum trade amount.
   *
   * @return {BigInt} The total Ethereum trade amount.
   */
  getTotalEthTradeAmount(): BigInt {
    let totalEthTradeAmount = BigInt.zero();
    for (let i = 0; i < this.considerationsLength; i++) {
      if( this.considerations[i].recipient === SEAPORT_FEE_RECIPIENT ) continue;
      const EthTradeAmount = this.considerations[i].amount;
      totalEthTradeAmount = totalEthTradeAmount.plus(EthTradeAmount);
    }
    return totalEthTradeAmount;
  }
}
