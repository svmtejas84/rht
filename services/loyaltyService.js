// services/loyaltyService.js
const db = require('../utils/db');
const config = require('../config');
const { LoyaltyLedgerType, LoyaltyLedgerStatus } = require('../models/enums');
const { v4: uuidv4 } = require('uuid');

const getTierBySpend = (annualSpend) => {
    const { tiers } = config.loyalty;
    // Tiers are sorted from highest to lowest threshold
    return tiers.find(tier => annualSpend >= tier.spendThreshold);
};

const calculateUserTier = async (userId) => {
    // TODO: Implement DB logic to get sum of completed order subtotals in last 365 days
    const annualSpend = await db.getAnnualSpend(userId); // e.g., 12500
    const tier = getTierBySpend(annualSpend);
    // TODO: Update user's loyaltyBalance in DB
    // await db.loyaltyBalances.update(userId, { tier: tier.name, annual_spend_₹: annualSpend });
    return tier;
};

const addPendingPoints = async (order) => {
    const tier = await calculateUserTier(order.buyerId);
    const pointsToEarn = Math.floor(order.subtotal * tier.earnRate);

    if (pointsToEarn > 0) {
        const ledgerEntry = {
            id: uuidv4(),
            user_id: order.buyerId,
            type: LoyaltyLedgerType.EARN,
            points: pointsToEarn,
            order_id: order.id,
            status: LoyaltyLedgerStatus.PENDING,
            created_at: new Date(),
        };
        await db.createLoyaltyLedgerEntry(ledgerEntry);
        console.log(`Added ${pointsToEarn} pending points for order ${order.id}.`);
    }
};

const makePointsAvailable = async (orderId) => {
    // TODO: Find the pending ledger entry for this orderId
    const ledgerEntry = await db.loyaltyLedgers.find({ order_id: orderId, status: LoyaltyLedgerStatus.PENDING });
    
    if (ledgerEntry) {
        // TODO: Update ledger entry status to AVAILABLE
        // await db.loyaltyLedgers.update(ledgerEntry.id, { status: LoyaltyLedgerStatus.AVAILABLE });
        
        // TODO: Update user's loyalty balance
        // await db.loyaltyBalances.increment(ledgerEntry.user_id, {
        //     available_points: ledgerEntry.points,
        //     pending_points: -ledgerEntry.points,
        //     lifetime_points: ledgerEntry.points
        // });
        console.log(`Made ${ledgerEntry.points} points available for user ${ledgerEntry.user_id}.`);
    }
};

const reversePointsForOrder = async (order) => {
    // TODO: Find the original "earn" ledger entry for this order
    const originalEntry = await db.loyaltyLedgers.find({ order_id: order.id, type: LoyaltyLedgerType.EARN });

    if (originalEntry) {
        const reverseEntry = {
            id: uuidv4(),
            user_id: order.buyerId,
            type: LoyaltyLedgerType.REVERSE,
            points: -originalEntry.points, // Negative value
            order_id: order.id,
            status: LoyaltyLedgerStatus.SETTLED,
            created_at: new Date(),
        };
        await db.createLoyaltyLedgerEntry(reverseEntry);

        // TODO: Decrement user's available points. This can go negative.
        // await db.loyaltyBalances.decrement(order.buyerId, { available_points: originalEntry.points });
        console.log(`Reversed ${originalEntry.points} points for refunded order ${order.id}.`);
    }
};

const redeemForDiscount = async (userId, pointsToRedeem) => {
    // TODO: Get user's current loyalty balance
    const balance = await db.loyaltyBalances.get(userId);
    
    if (balance.available_points < pointsToRedeem) {
        throw new Error("Insufficient points.");
    }

    const burnEntry = {
        id: uuidv4(),
        user_id: userId,
        type: LoyaltyLedgerType.BURN,
        points: -pointsToRedeem,
        status: LoyaltyLedgerStatus.SETTLED,
        created_at: new Date(),
    };
    await db.createLoyaltyLedgerEntry(burnEntry);
    
    // TODO: Update loyalty balance
    // await db.loyaltyBalances.decrement(userId, { available_points: pointsToRedeem });

    const discountAmount = pointsToRedeem * config.loyalty.pointValueInRupees;
    return { success: true, discountAmount };
};

const redeemForGiveback = async (userId, pointsToDonate) => {
    // Similar logic to redeemForDiscount
    const { rupeesPerTree } = config.giveback;

    // TODO: Redeem points (create burn entry, update balance)
    
    const donationValue = pointsToDonate * config.loyalty.pointValueInRupees;
    const treesFunded = Math.floor(donationValue / rupeesPerTree);

    if (treesFunded > 0) {
        // TODO: Create a giveback_log entry in the DB
        console.log(`User ${userId} donated ${pointsToDonate} points to fund ${treesFunded} trees.`);
    }

    return { success: true, treesFunded };
};

module.exports = {
    addPendingPoints,
    makePointsAvailable,
    reversePointsForOrder,
    redeemForDiscount,
    redeemForGiveback,
    calculateUserTier
};