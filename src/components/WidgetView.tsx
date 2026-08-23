import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import language from '../languages/selected';
import { formatDateFromIso } from '../utils/date';

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

export default function WidgetView(props: Props) {
  const { festivalDays, nextTwoDaysWithFestivals, showWidgetHint, canPin, onRequestPin, onDismissHint } = props;

  return (
    <View style={styles.widgetChrome}>
      {showWidgetHint && (
        <View style={styles.hint}>
          <Text style={styles.hintTitle}>{language.widgetHintTitle}</Text>
          <Text style={styles.hintBody}>{language.widgetHintBody}</Text>
          <View style={styles.hintActions}>
            {canPin && (
              <Pressable onPress={onRequestPin} style={styles.hintButton}>
                <Text style={styles.hintButtonText}>{language.addWidget}</Text>
              </Pressable>
            )}
            <Pressable onPress={onDismissHint} style={[styles.hintButton, styles.hintDismiss]}>
              <Text style={styles.hintDismissText}>{language.notNow}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {festivalDays.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardDate}>
            {language.today}: {(() => {
              const raw = String(festivalDays[0].date || '');
              const match = raw.match(/\((\d{4}-\d{2}-\d{2})\)/);
              const iso = match ? match[1] : raw.match(/\d{4}-\d{2}-\d{2}/)?.[0] || raw;
              return formatDateFromIso(iso, language);
            })()}
          </Text>
          <Text style={styles.cardYear}>{language.year}: {String(festivalDays[0].year || '')}</Text>
          <Text style={styles.cardThidi}>{language.thidi}: {String(festivalDays[0].Thidi || '')}</Text>

          {festivalDays[0].festivals.length > 0 && (
            <View style={styles.festivalList}>
              <Text style={styles.upcomingLabel}>{language.festivals}:</Text>
              {festivalDays[0].festivals.map(fest => (
                <Text key={fest} style={styles.festivalItem}>🎉 {fest}</Text>
              ))}
            </View>
          )}
        </View>
      ) : (
        <Text style={styles.noFestival}>{language.noFestivalData}</Text>
      )}

      {nextTwoDaysWithFestivals.length > 0 && (
        <View style={styles.upcomingBox}>
          <Text style={styles.upcomingLabel}>{language.upcoming}:</Text>
          <View style={styles.upcomingList}>
            {nextTwoDaysWithFestivals.map(day => (
              <Text key={day.date} style={styles.upcomingValue}>
                {(() => {
                  const raw = String(day.date || '');
                  const match = raw.match(/\((\d{4}-\d{2}-\d{2})\)/);
                  const iso = match ? match[1] : raw.match(/\d{4}-\d{2}-\d{2}/)?.[0] || raw;
                  const dateText = formatDateFromIso(iso, language);
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
