// models/enums.js
const OrderStatus = Object.freeze({
  CREATED: 'Created',
  PAID_HELD: 'Paid-Held',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  RELEASED: 'Released',
  REFUNDED: 'Refunded',
  CLOSED: 'Closed',
});

const DisputeStatus = Object.freeze({
  NONE: 'None',
  OPEN: 'Open',
  RESOLVED: 'Resolved',
});

const KycStatus = Object.freeze({
  NOT_STARTED: 'not_started',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
});

const LoyaltyLedgerType = Object.freeze({
    EARN: 'earn',
    BURN: 'burn', // Redemption
    REVERSE: 'reverse', // Refund
});

const LoyaltyLedgerStatus = Object.freeze({
    PENDING: 'pending',
    AVAILABLE: 'available',
    SETTLED: 'settled',
});

module.exports = {
  OrderStatus,
  DisputeStatus,
  KycStatus,
  LoyaltyLedgerType,
  LoyaltyLedgerStatus
};