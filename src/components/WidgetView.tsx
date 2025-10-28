import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type FestivalDay = {
  date: string;
  Thidi: string;
  year: string;
  festivals: string[];
};

type Props = {
  festivalDays: FestivalDay[];
  nextTwoDaysWithFestivals: FestivalDay[];
  isDarkMode: boolean;
  showWidgetHint: boolean;
  canPin: boolean;
  onRequestPin?: () => Promise<void>;
  onDismissHint?: () => Promise<void>;
};

function formatTeluguDateFromIso(iso: string): string {
  try {
    const [y, m, d] = iso.split('-').map(s => parseInt(s, 10));
    const months = [
      'జనవరు', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్',
      'జూలై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్'
    ];
    const weekdays = ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని'];
    const day = d;
    const monthName = months[m - 1] || '';
    const wk = new Date(iso).getDay();
    const shortWeek = weekdays[wk] || '';
    return `${day} ${monthName}, ${y} (${shortWeek})`;
  } catch (e) {
    return iso;
  }
}

export default function WidgetView(props: Props) {
  const { festivalDays, nextTwoDaysWithFestivals, isDarkMode, showWidgetHint, canPin, onRequestPin, onDismissHint } = props;

  return (
    <View style={styles.widgetChrome}>
      {showWidgetHint && (
        <View style={styles.hint}>
          <Text style={styles.hintTitle}>Add the home screen widget</Text>
          <Text style={styles.hintBody}>Get today’s Telugu festivals at a glance. Add the “Telugu Festival Reminder” widget to your home screen.</Text>
          <View style={styles.hintActions}>
            {canPin && (
              <Pressable onPress={onRequestPin} style={styles.hintButton}>
                <Text style={styles.hintButtonText}>Add widget</Text>
              </Pressable>
            )}
            <Pressable onPress={onDismissHint} style={[styles.hintButton, styles.hintDismiss]}>
              <Text style={styles.hintDismissText}>Not now</Text>
            </Pressable>
          </View>
        </View>
      )}

      {festivalDays.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardDate}>
            ఈ రోజు: {(() => {
              const raw = String(festivalDays[0].date || '');
              const match = raw.match(/\((\d{4}-\d{2}-\d{2})\)/);
              const iso = match ? match[1] : raw.match(/\d{4}-\d{2}-\d{2}/)?.[0] || raw;
              return formatTeluguDateFromIso(iso);
            })()}
          </Text>
          <Text style={styles.cardYear}>సం: {String(festivalDays[0].year || '')}</Text>
          <Text style={styles.cardThidi}>తిథి: {String(festivalDays[0].Thidi || '')}</Text>

          {festivalDays[0].festivals.length > 0 && (
            <View style={styles.festivalList}>
              <Text style={styles.upcomingLabel}>పండుగలు:</Text>
              {festivalDays[0].festivals.map(fest => (
                <Text key={fest} style={styles.festivalItem}>🎉 {fest}</Text>
              ))}
            </View>
          )}
        </View>
      ) : (
        <Text style={styles.noFestival}>No festival data available.</Text>
      )}

      {nextTwoDaysWithFestivals.length > 0 && (
        <View style={styles.upcomingBox}>
          <Text style={styles.upcomingLabel}>రాబోయే పండుగలు (2 రోజుల్లో):</Text>
          <View style={styles.upcomingList}>
            {nextTwoDaysWithFestivals.map(day => (
              <Text key={day.date} style={styles.upcomingValue}>
                {(() => {
                  const raw = String(day.date || '');
                  const match = raw.match(/\((\d{4}-\d{2}-\d{2})\)/);
                  const iso = match ? match[1] : raw.match(/\d{4}-\d{2}-\d{2}/)?.[0] || raw;
                  const dateText = formatTeluguDateFromIso(iso);
                  const fest = day.festivals[0];
                  return (<>{dateText}: <Text style={{color: '#ff0000'}}>{fest}</Text></>);
                })()}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  widgetChrome: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    padding: 8,
    width: '100%'
  },
  card: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 248, 225, 0.95)'
  },
  cardDate: { fontSize: 18, fontWeight: '700', color: '#ff6f00', marginBottom: 6 },
  cardThidi: { fontSize: 15, color: '#333', marginBottom: 6 },
  cardYear: { fontSize: 14, color: '#333', marginBottom: 6 },
  festivalList: { marginTop: 6 },
  festivalItem: { color: '#d32f2f', marginBottom: 4 },
  upcomingBox: { marginTop: 8, padding: 10, borderRadius: 8, backgroundColor: 'rgba(227,242,253,0.95)' },
  upcomingLabel: { fontSize: 14, fontWeight: '700', color: '#1976d2', marginBottom: 6 },
  upcomingList: { width: '100%' },
  upcomingValue: { fontSize: 14, color: '#1976d2', marginBottom: 4 },
  noFestival: { fontStyle: 'italic', color: '#666' },
  hint: { backgroundColor: '#e8f5e9', borderColor: '#a5d6a7', borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 },
  hintTitle: { fontWeight: '700', color: '#2e7d32', marginBottom: 6 },
  hintBody: { color: '#2e7d32', marginBottom: 8 },
  hintActions: { flexDirection: 'row' },
  hintButton: { backgroundColor: '#2e7d32', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  hintButtonText: { color: 'white', fontWeight: '600' },
  hintDismiss: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#2e7d32' },
  hintDismissText: { color: '#2e7d32', fontWeight: '600' }
});
