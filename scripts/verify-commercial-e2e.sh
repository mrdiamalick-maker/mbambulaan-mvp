#!/usr/bin/env sh
set -eu

BASE_URL="${BASE_URL:-http://127.0.0.1:18080}"

session() {
  identity="$1"
  territory="$2"
  curl --fail --silent -X POST "$BASE_URL/api/v1/access/sessions" \
    -H 'content-type: application/json' \
    -d "{\"identityId\":\"$identity\",\"territoryId\":\"$territory\"}" | jq -r '.session.id'
}

post() {
  url="$1"
  token="$2"
  payload="$3"
  curl --fail --silent -X POST "$BASE_URL$url" \
    -H 'content-type: application/json' \
    -H "x-mbambulaan-demo-session: $token" \
    -d "$payload"
}

seller_session="$(session demo-cooperative-dakar territory-dakar)"
buyer_session="$(session demo-buyer-hotel-dakar territory-dakar)"
logistics_session="$(session demo-cold-chain-operator territory-dakar)"
finance_session="$(session demo-finance-officer territory-national)"

post /api/v1/commercial-catalog "$seller_session" \
  '{"action":"seed_demo","commandId":"e2e-seed-001","at":"2026-07-27T08:00:00.000Z"}' >/tmp/catalog-seed.json

post /api/v1/commercial-catalog "$buyer_session" \
  '{"action":"reserve","commandId":"e2e-reserve-001","reservationId":"reservation-e2e-001","offerId":"offer-thiof-01","quantityKg":400,"logisticsOptionId":"log-dakar-cold","ttlMinutes":60,"at":"2026-07-27T09:00:00.000Z"}' >/tmp/catalog-reserve.json

confirm_response="$(post /api/v1/commercial-catalog "$buyer_session" \
  '{"action":"confirm_reservation","commandId":"e2e-confirm-001","reservationId":"reservation-e2e-001","at":"2026-07-27T09:05:00.000Z"}')"
order_id="$(printf '%s' "$confirm_response" | jq -r '.conversion.link.orderId')"
[ -n "$order_id" ] && [ "$order_id" != "null" ]

post /api/v1/commercial-flow/commands "$seller_session" \
  "{\"commandId\":\"e2e-allocate-001\",\"command\":{\"type\":\"allocate_order\",\"orderId\":\"$order_id\"}}" >/tmp/order-allocated.json

post /api/v1/commercial-flow/commands "$logistics_session" \
  "{\"commandId\":\"e2e-transport-001\",\"command\":{\"type\":\"start_transport\",\"orderId\":\"$order_id\"}}" >/tmp/order-transport.json

post /api/v1/commercial-flow/commands "$logistics_session" \
  "{\"commandId\":\"e2e-delivery-001\",\"command\":{\"type\":\"confirm_delivery\",\"orderId\":\"$order_id\",\"proofId\":\"proof-e2e-001\"}}" >/tmp/order-delivered.json

payment_response="$(post /api/v1/commercial-flow/commands "$buyer_session" \
  "{\"commandId\":\"e2e-payment-request-001\",\"command\":{\"type\":\"request_payment\",\"orderId\":\"$order_id\"}}")"
payment_id="$(printf '%s' "$payment_response" | jq -r '.payments[] | select(.orderId == "'"$order_id"'") | .id' | head -n 1)"
[ -n "$payment_id" ] && [ "$payment_id" != "null" ]

post /api/v1/commercial-flow/commands "$finance_session" \
  "{\"commandId\":\"e2e-payment-confirm-001\",\"command\":{\"type\":\"confirm_payment\",\"paymentId\":\"$payment_id\",\"providerReference\":\"MM-E2E-001\"}}" >/tmp/payment-confirmed.json

final_response="$(post /api/v1/commercial-flow/commands "$finance_session" \
  "{\"commandId\":\"e2e-reconcile-001\",\"command\":{\"type\":\"reconcile_order\",\"orderId\":\"$order_id\"}}")"
printf '%s' "$final_response" | jq -e --arg order "$order_id" '
  (.orders[] | select(.id == $order) | .status) == "reconciled"
  and .economics.platformRevenueXof == 25000
  and .economics.confirmedPaymentsXof == 1125000
  and ([.ledger[] | select(.orderId == $order and .status == "settled")] | length) == 3
' >/dev/null

finance_queue="$(curl --fail --silent "$BASE_URL/api/v1/commercial-work-queue" -H "x-mbambulaan-demo-session: $finance_session")"
printf '%s' "$finance_queue" | jq -e '.items | length == 0' >/dev/null

printf 'Commercial E2E verified: order=%s payment=%s total=1125000 platform=25000\n' "$order_id" "$payment_id"
