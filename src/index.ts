import { GetOrderbookResponse } from '@spinfi/core/build/types/spot'
import { createPerpApi } from '@spinfi/node'
import { convertDecimalStringToNumber, convertNumberToDecimalString } from 'utils.js'

const ACCOUNT_ID = '<--ACCOUNT_ID-->'
const PRIVATE_KEY = '<--PRIVATE_KEY-->'
// https://docs.api.spin.fi/perp/#perp-contract-api
const CONTRACT_ID = 'v2_0_2.perp.spin-fi.testnet'
const WEBSOCKET_URL = 'wss://testnet.api.spin.fi/perp/v1/ws'

const NEAR_NETWORK = 'testnet'

const main = async () => {
  const api = await createPerpApi({
    accountId: ACCOUNT_ID,
    privateKey: PRIVATE_KEY,
    contractId: CONTRACT_ID,
    network: NEAR_NETWORK,
    websocket: WEBSOCKET_URL,
  })

  // https://docs.api.spin.fi/perp/#get_market
  const market = await api.spin.getMarket({
    marketId: 1,
  })

  console.log('MARKET EXAMPLE:')
  console.dir(market)
  console.log('———————————————')
  console.log('')
  console.log('')

  // Example converting numbers
  const marketTickSize = convertDecimalStringToNumber(market.limits.tick_size)
  console.log(`${market.symbol} TICK SIZE:`, marketTickSize)
  console.log('———————————————')
  console.log('')
  console.log('')

  // Example getting order book
  // https://docs.api.spin.fi/perp/#get_orderbook
  // Uncomment this
  // const orderbook = await api.spin.getOrderbook({
  //   marketId: 1,
  // })
  // console.log(`${market.symbol} ORDER BOOK:`, orderbook)
  // console.log('———————————————')

  // Custom function example
  // Example getting order book
  // https://docs.api.spin.fi/perp/#get_orderbook
  const orderbook_level_one: GetOrderbookResponse = await api.near.view('v2_0_2.perp.spin-fi.testnet', 'get_orderbook', { market_id: market.id, limit: 1 })

  console.log(`${market.symbol} ORDER BOOK L1:`)
  console.dir(orderbook_level_one)
  console.log('')
  console.log(`${market.symbol} ORDER BOOK L1 PRETTY:`)
  console.table({
    asks: {
      price: convertDecimalStringToNumber(orderbook_level_one.ask_orders[0].price),
      quantity: convertDecimalStringToNumber(orderbook_level_one.ask_orders[0].quantity),
    },
    bids: {
      price: convertDecimalStringToNumber(orderbook_level_one.bid_orders[0].price),
      quantity: convertDecimalStringToNumber(orderbook_level_one.bid_orders[0].quantity),
    },
  })
  console.log('———————————————')
  console.log('')

  // Account Balances
  // https://docs.api.spin.fi/perp/#get_base_currency
  // https://docs.api.spin.fi/perp/#get_balance
  const balances = await api.spin.getBalances({
    accountId: ACCOUNT_ID,
  })
  const baseCurrency = await api.spin.getBaseCurrency()
  console.log(`${ACCOUNT_ID} BALANCES:`)
  console.dir(balances)
  console.log(``)
  console.log(`${ACCOUNT_ID} BALANCES PRETTY:`)
  console.dir({
    token: baseCurrency.symbol,
    address: baseCurrency.address,
    token_amount_on_smart_contract: convertDecimalStringToNumber(balances, baseCurrency.decimals),
  })
  console.log('———————————————')
  console.log('')

  // Getting Orders
  // https://docs.api.spin.fi/perp/#get_orders
  const orders = await api.spin.getOrders({
    marketId: market.id,
    accountId: ACCOUNT_ID,
  })
  console.log(`${ACCOUNT_ID} ORDERS:`)
  console.dir(orders)
  console.log('———————————————')
  console.log('')
  console.log('')

  // Canceling first order if exist
  // https://docs.api.spin.fi/perp/#cancel_order
  if (orders.length > 0) {
    console.log(`CANCELING ${ACCOUNT_ID} ID:${orders[0].id} ORDER:`)
    await api.spin.cancelOrder({
      marketId: market.id,
      orderId: orders[0].id,
    })
    console.log('———————————————')
    console.log('')
    console.log('')
  }

  // Creating order
  // https://docs.api.spin.fi/perp/#place_ask
  console.log('PLACING ORDER')
  console.log('ASK 10 NEAR-PERP CONTRACTS @ 1 USDC')
  await api.spin.placeAsk({
    marketId: market.id,
    // @ts-ignore
    price: convertNumberToDecimalString(1),
    // @ts-ignore
    quantity: convertNumberToDecimalString(10),
    marketOrder: false,
    clientOrderId: 999,
    postOnly: true,
  })
  console.log('———————————————')
  console.log('')
  console.log('')

  // Get position
  // https://docs.api.spin.fi/perp/#check_position
  console.log('GETTING POSITIONS')
  const positions = await api.spin.getPositions({
    accountId: ACCOUNT_ID,
  })
  console.log(positions)
  console.log('———————————————')
  console.log('')
  console.log('')

  // Subscription example
  console.log('L1 ORDERBOOK SUBSCRIPTION:')
  api.spin.listenBookL1(
    {
      marketId: 1,
    },
    {
      onNotifyOk: (notify) => {
        console.log(notify)
      },
    },
  )
  console.log('———————————————')
  console.log('')
  console.log('')
}

main()
