// services/notificationService.js
// --- MOCKED NOTIFICATION SERVICE ---
// In a real application, this would integrate with an email or push notification service.

console.log("Mock Notification Service Initialized");

const notify = async (userId, message) => {
    // Simulate sending a notification
    console.log(`[Notification Mock] TO: ${userId} | MESSAGE: "${message}"`);
    return Promise.resolve({ success: true });
};

module.exports = {
    notify,
};