

function getTodayAndNextTwoDates(): string[] {
  const today = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const format = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return [
    format(today),
    format(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)),
    format(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)),
  ];
}
// ...existing code...






import { useEffect, useState } from "react";
import { StatusBar, StyleSheet, Text, useColorScheme, View, Platform, PermissionsAndroid } from "react-native";
import notifee, { TimestampTrigger, TriggerType, AndroidImportance, AndroidColor } from '@notifee/react-native';

// Helper to create channel and schedule notification for 6 AM
async function setupNotifee(todayFestivals: string[]) {
  // Create channel (Android)
  await notifee.createChannel({
    id: 'festival-reminder',
    name: 'Festival Reminder',
    importance: AndroidImportance.HIGH,
    lights: true,
    vibration: true,
    badge: true,
    sound: 'default',
    description: 'Daily festival notifications',
    lightColor: AndroidColor.PURPLE,
  });

  // Request permission (Android 13+)
  await notifee.requestPermission();

  // Cancel all previous triggers
  await notifee.cancelAllNotifications();

  // Schedule notification for 6AM
  const now = new Date();
  let sixAM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0, 0);
  if (now > sixAM) {
    sixAM.setDate(sixAM.getDate() + 1);
  }
  const message = todayFestivals.length > 0
    ? `Today's festivals: ${todayFestivals.join(', ')}`
    : 'No festivals today.';
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: sixAM.getTime(),
    repeatFrequency: 1, // DAILY
    alarmManager: true,
  };
  await notifee.createTriggerNotification(
    {
      title: 'Telugu Festival Reminder',
      body: message,
      android: {
        channelId: 'festival-reminder',
        smallIcon: 'ic_launcher',
        color: '#512da8',
        pressAction: { id: 'default' },
      },
    },
    trigger
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  // Transparent to let inner translucent components be apparent
  backgroundColor: 'transparent',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
    color: '#512da8',
    letterSpacing: 0.5
  },
  card: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 14,
  // Soft translucent card background
  backgroundColor: 'rgba(255, 248, 225, 0.9)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
  borderColor: 'rgba(255, 224, 130, 0.6)'
  },
  cardDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6f00',
    marginBottom: 8
  },
  cardThidi: {
  fontSize: 16,
  color: '#333',
  marginBottom: 2,
  width: '100%',
  textAlign: 'left',
  lineHeight: 24,
  paddingVertical: 2,
  includeFontPadding: true
  },
  cardThidiValue: {
    fontWeight: 'bold',
    color: '#1976d2'
  },
  cardYear: {
  fontSize: 16,
  color: '#333',
  marginBottom: 8,
  width: '100%',
  textAlign: 'left',
  lineHeight: 22,
  paddingVertical: 2,
  includeFontPadding: true
  },
  cardYearValue: {
    fontWeight: 'bold',
    color: '#388e3c'
  },
  festivalList: {
    marginTop: 6,
    width: '100%',
    alignItems: 'center'
  },
  festivalItem: {
    fontSize: 16,
    color: '#d84315',
    marginBottom: 2
  },
  noFestival: {
    fontSize: 15,
    color: '#888',
    marginTop: 8,
    fontStyle: 'italic'
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  upcomingBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 10,
  backgroundColor: 'rgba(227, 242, 253, 0.9)',
    alignItems: 'center',
    borderWidth: 1,
  borderColor: 'rgba(144, 202, 249, 0.6)',
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  // Subtle translucent gray chrome to hint this is a widget container
  widgetChrome: {
  backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 16,
    padding: 8,
  borderWidth: 1,
  borderColor: 'rgba(0,0,0,0.15)'
  },
  upcomingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 6,
    letterSpacing: 0.2
  },
  upcomingList: {
    width: '100%',
    alignItems: 'center'
  },
  upcomingValue: {
    fontSize: 15,
    color: '#1976d2',
    marginBottom: 2
  },
});

type FestivalDay = {
  date: string;
  Thidi: string;
  year: string;
  festivals: string[];
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [festivalDays, setFestivalDays] = useState<FestivalDay[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setup() {
      // Request notification permission for Android 13+
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        try {
          const granted = await PermissionsAndroid.request(
            'android.permission.POST_NOTIFICATIONS',
            {
              title: 'Festival Notifications',
              message: 'Allow Telugu Festival Reminder to send you daily festival notifications?',
              buttonPositive: 'Allow',
              buttonNegative: 'Deny',
            }
          );
        } catch (err) {
          // ignore
        }
      }
      try {
        // Use require to load the bundled JSON asset
        const allDays: FestivalDay[] = require('./assets/festivals2025.json');
        const wantedDates = getTodayAndNextTwoDates();
        // Extract the (YYYY-MM-DD) part from the date string in JSON
        // Only show the current day
        const today = allDays.filter(day => {
          const match = day.date.match(/\((\d{4}-\d{2}-\d{2})\)/);
          if (!match) return false;
          return wantedDates[0] === match[1];
        });
        setFestivalDays(today);
        // Schedule notification for 6AM using Notifee
        if (today.length > 0) {
          await setupNotifee(today[0].festivals);
        } else {
          await setupNotifee([]);
        }
      } catch (e) {
        setError('Failed to load festival data.');
      }
    }
    setup();
  }, []);

  // Compute next-2-days entries that actually have festivals
  const allDays: FestivalDay[] = require('./assets/festivals2025.json');
  const wantedDates = getTodayAndNextTwoDates();
  const nextTwoDaysWithFestivals = allDays.filter(day => {
    const match = day.date.match(/\((\d{4}-\d{2}-\d{2})\)/);
    if (!match) return false;
    const isNextTwo = wantedDates.slice(1).includes(match[1]);
    return isNextTwo && Array.isArray(day.festivals) && day.festivals.length > 0;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
  <Text style={styles.header}>Telugu Festival Reminder</Text>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        festivalDays.length > 0 && (
          <View style={styles.widgetChrome}>
            <View style={styles.card}>
              {/* Today block with Telugu labels */}
              <Text style={styles.cardDate}>ఈ రోజు: {festivalDays[0].date}</Text>
              <Text style={styles.cardThidi}>తిది: {String(festivalDays[0].Thidi || '')}</Text>
              <Text style={styles.cardYear}>సం: {String(festivalDays[0].year || '')}</Text>

              {/* Only show header and list if there are any festivals today */}
              {festivalDays[0].festivals.length > 0 && (
                <View style={styles.festivalList}>
                  <Text style={styles.upcomingLabel}>పండుగలు:</Text>
                  {festivalDays[0].festivals.map(fest => (
                    <Text key={fest} style={styles.festivalItem}>🎉 {fest}</Text>
                  ))}
                </View>
              )}
            </View>

            {/* Next 2 days: show only entries that have at least one festival */}
            {nextTwoDaysWithFestivals.length > 0 && (
              <View style={styles.upcomingBox}>
                <Text style={styles.upcomingLabel}>రాబోయే పండుగలు (2 రోజుల్లో):</Text>
                <View style={styles.upcomingList}>
                  {nextTwoDaysWithFestivals.map(day => (
                    <Text key={day.date} style={styles.upcomingValue}>
                      {day.date}: {day.festivals[0]}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        )
      )}
    </View>
  );
}

export default App;