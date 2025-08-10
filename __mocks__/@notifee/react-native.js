const notifee = {
  createChannel: jest.fn(async () => 'festival-reminder'),
  requestPermission: jest.fn(async () => true),
  cancelAllNotifications: jest.fn(async () => {}),
  createTriggerNotification: jest.fn(async () => {}),
};

module.exports = Object.assign(notifee, {
  AndroidImportance: { HIGH: 4 },
  AndroidColor: { PURPLE: 0 },
  TriggerType: { TIMESTAMP: 0 },
});
