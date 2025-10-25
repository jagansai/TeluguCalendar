

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
// Format ISO date (YYYY-MM-DD) to Telugu: "D MonthName, YYYY (YYYY-MM-DD)"
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
    const wk = new Date(iso).getDay(); // 0=Sun
    const shortWeek = weekdays[wk] || '';
    return `${day} ${monthName}, ${y} (${shortWeek})`;
  } catch (e) {
    return iso;
  }
}
// ...existing code...






import { useEffect, useState } from "react";
import { StatusBar, StyleSheet, Text, useColorScheme, View, Platform, Pressable, ScrollView } from "react-native";
import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';



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
  marginTop: 12,
    textAlign: 'center',
  color: '#222222',
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
  color: '#ff0000',
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
  dateText: {
    fontSize: 15,
    color: '#1976d2',
    marginBottom: 2
  },
  hint: {
    backgroundColor: '#e8f5e9',
    borderColor: '#a5d6a7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  hintTitle: { fontWeight: 'bold', color: '#2e7d32', marginBottom: 4 },
  hintBody: { color: '#2e7d32', marginBottom: 8 },
  hintActions: { flexDirection: 'row' },
  hintButton: { backgroundColor: '#2e7d32', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  hintButtonText: { color: 'white', fontWeight: '600' },
  hintDismiss: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#2e7d32' },
  hintDismissText: { color: '#2e7d32', fontWeight: '600' }
  ,
  calendarWrapper: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  calendarColumn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)'
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 6
  },
  navButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.03)'
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600'
  },
  navButtonDisabled: {
    opacity: 0.35
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  weekdayLabel: {
    width: 56,
    textAlign: 'center',
    fontSize: 12,
    color: '#666'
  },
  dayCell: {
    width: 56,
    height: 80,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  dayCellInactive: {
    opacity: 0.15
  },
  dayCellFestival: {
    backgroundColor: '#ffd54f'
  },
  dayCellDate: {
    fontSize: 18,
    fontWeight: '800'
  },
  dayCellThidi: {
    fontSize: 12,
    color: '#444',
    marginTop: 6,
    textAlign: 'center'
  },
  rightList: {
    width: 180,
    marginLeft: 12
  },
  rightItem: {
    marginBottom: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.02)'
  },
  rightItemDate: { fontSize: 12, color: '#555', marginBottom: 4 },
  rightItemName: { fontSize: 14, color: '#d32f2f', fontWeight: '600' }
  ,
  dayCellFestivalText: {
    color: '#2f2f2f',
    fontWeight: '700'
  },
  dayCellFestivalBg: {
    backgroundColor: '#ffd54f'
  },
  lowerFestivals: {
    marginTop: 12,
    flex: 1,
    backgroundColor: 'rgba(255, 250, 230, 0.9)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 224, 130, 0.6)'
  },
  monthFestivalsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#6a1b9a'
  }
});

type FestivalDay = {
  date: string;
  Thidi: string;
  shortThidi?: string;
  year: string;
  festivals: string[];
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [festivalDays, setFestivalDays] = useState<FestivalDay[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showWidgetHint, setShowWidgetHint] = useState(false);
  const [canPin, setCanPin] = useState(false);
  // calendar state
  const [monthStart, setMonthStart] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Load all festival days once (bundled asset)
  const allDays: FestivalDay[] = require('./assets/festivals.json');

  // Helpers for calendar generation
  const isoFromDate = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const makeMonthMatrix = (startOfMonth: Date) => {
    // returns array of weeks; each week is array of 7 Date | null
    const year = startOfMonth.getFullYear();
    const month = startOfMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    // Fill leading nulls
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    // Fill days
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    // Fill trailing nulls to complete weeks
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  };

  // Build a quick lookup map from ISO date -> FestivalDay
  const festivalMap: Record<string, FestivalDay> = {};
  try {
    for (const d of allDays) {
      const m = String(d.date || '').match(/\((\d{4}-\d{2}-\d{2})\)/);
      if (!m) continue;
      festivalMap[m[1]] = d;
    }
  } catch (e) {
    // ignore
  }

  const weeks = makeMonthMatrix(monthStart);

  // Compute min/max month available from data so we can clamp navigation
  const monthRange = (() => {
    let minIso: string | null = null;
    let maxIso: string | null = null;
    for (const fd of allDays) {
      const m = String(fd.date || '').match(/\((\d{4}-\d{2}-\d{2})\)/);
      if (!m) continue;
      const iso = m[1];
      if (!minIso || iso < minIso) minIso = iso;
      if (!maxIso || iso > maxIso) maxIso = iso;
    }
    if (!minIso || !maxIso) return null;
    const [minY, minM] = minIso.split('-').map(s => parseInt(s, 10));
    const [maxY, maxM] = maxIso.split('-').map(s => parseInt(s, 10));
    return { min: new Date(minY, minM - 1, 1), max: new Date(maxY, maxM - 1, 1) };
  })();

  // Ensure monthStart is within available range
  useEffect(() => {
    if (!monthRange) return;
    const msY = monthStart.getFullYear();
    const msM = monthStart.getMonth();
    const minY = monthRange.min.getFullYear();
    const minM = monthRange.min.getMonth();
    const maxY = monthRange.max.getFullYear();
    const maxM = monthRange.max.getMonth();
    const beforeMin = msY < minY || (msY === minY && msM < minM);
    const afterMax = msY > maxY || (msY === maxY && msM > maxM);
    if (beforeMin) setMonthStart(new Date(minY, minM, 1));
    else if (afterMax) setMonthStart(new Date(maxY, maxM, 1));
  }, [monthRange]);

  const monthFestivals = Object.values(festivalMap).filter(fd => {
    const m = String(fd.date || '').match(/\((\d{4}-\d{2}-\d{2})\)/);
    if (!m) return false;
    const iso = m[1];
    const [y, mo] = iso.split('-').map(s => parseInt(s, 10));
    // Only include days that actually have festival entries
    const hasFest = Array.isArray(fd.festivals) && fd.festivals.length > 0;
    return hasFest && y === monthStart.getFullYear() && mo === monthStart.getMonth() + 1;
  }).sort((a, b) => {
    const ma = a.date.match(/\((\d{4}-\d{2}-\d{2})\)/)![1];
    const mb = b.date.match(/\((\d{4}-\d{2}-\d{2})\)/)![1];
    return ma.localeCompare(mb);
  });

  const goPrevMonth = () => {
    if (!monthRange) return setMonthStart(s => new Date(s.getFullYear(), s.getMonth() - 1, 1));
    const min = monthRange.min;
    const candidate = new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1);
    if (candidate.getFullYear() < min.getFullYear() || (candidate.getFullYear() === min.getFullYear() && candidate.getMonth() < min.getMonth())) return;
    setMonthStart(candidate);
  };

  const goNextMonth = () => {
    if (!monthRange) return setMonthStart(s => new Date(s.getFullYear(), s.getMonth() + 1, 1));
    const max = monthRange.max;
    const candidate = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
    if (candidate.getFullYear() > max.getFullYear() || (candidate.getFullYear() === max.getFullYear() && candidate.getMonth() > max.getMonth())) return;
    setMonthStart(candidate);
  };

  useEffect(() => {
  async function setup() {
      try {
        // Use the already-loaded bundled JSON asset. Expect 'festivals.json' to be present.
        const wantedDates = getTodayAndNextTwoDates();
        // Extract the (YYYY-MM-DD) part from the date string in JSON
        // Only show the current day
        const today = allDays.filter(day => {
          const match = day.date.match(/\((\d{4}-\d{2}-\d{2})\)/);
          if (!match) return false;
          return wantedDates[0] === match[1];
        });
        setFestivalDays(today);
        // no notification scheduling
      } catch (e) {
        setError('Failed to load festival data.');
      }
      // Widget hint logic
      try {
        const dismissed = await AsyncStorage.getItem('widgetHintDismissed');
        let supported = false;
        if (Platform.OS === 'android' && (NativeModules as any).WidgetPin?.isPinSupported) {
          supported = await (NativeModules as any).WidgetPin.isPinSupported();
        }
        setCanPin(supported);
        setShowWidgetHint(!dismissed && supported);
      } catch {}
    }
    setup();
  }, []);

  // Compute next-2-days entries that actually have festivals
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
      {showWidgetHint && (
        <View style={styles.hint}>
          <Text style={styles.hintTitle}>Add the home screen widget</Text>
          <Text style={styles.hintBody}>
            Get today’s Telugu festivals at a glance. Add the “Telugu Festival Reminder” widget to your home screen.
          </Text>
          <View style={styles.hintActions}>
            {canPin && (
              <Pressable
                onPress={async () => {
                  try {
                    await (NativeModules as any).WidgetPin.requestPin();
                    await AsyncStorage.setItem('widgetHintDismissed', '1');
                    setShowWidgetHint(false);
                  } catch {}
                }}
                style={styles.hintButton}
              >
                <Text style={styles.hintButtonText}>Add widget</Text>
              </Pressable>
            )}
            <Pressable
              onPress={async () => {
                await AsyncStorage.setItem('widgetHintDismissed', '1');
                setShowWidgetHint(false);
              }}
              style={[styles.hintButton, styles.hintDismiss]}
            >
              <Text style={styles.hintDismissText}>Not now</Text>
            </Pressable>
          </View>
        </View>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Calendar month view */}
      <View style={{height: 12}} />
      <View style={styles.calendarWrapper}>
        <View style={styles.calendarColumn}>
          <View style={styles.monthHeader}>
            {(() => {
              const isAtMin = monthRange ? (monthStart.getFullYear() === monthRange.min.getFullYear() && monthStart.getMonth() === monthRange.min.getMonth()) : false;
              const isAtMax = monthRange ? (monthStart.getFullYear() === monthRange.max.getFullYear() && monthStart.getMonth() === monthRange.max.getMonth()) : false;
              return (
                <>
                  <Pressable onPress={goPrevMonth} disabled={isAtMin} style={[styles.navButton, isAtMin && styles.navButtonDisabled]}><Text>{'‹'}</Text></Pressable>
                  <Text style={styles.monthTitle}>{(() => { const months = ['జనవరి','ఫిబ్రవరి','మార్చి','ఏప్రిల్','మే','జూన్','జూలై','ఆగస్టు','సెప్టెంబర్','అక్టోబర్','నవంబర్','డిసెంబర్']; return `${months[monthStart.getMonth()]} ${monthStart.getFullYear()}`; })()}</Text>
                  <Pressable onPress={goNextMonth} disabled={isAtMax} style={[styles.navButton, isAtMax && styles.navButtonDisabled]}><Text>{'›'}</Text></Pressable>
                </>
              )
            })()}
          </View>
          <View style={styles.weekRow}>
            {['ఆది','సోమ','మంగళ','బుధ','గురు','శుక్ర','శని'].map((w) => (
              <Text key={w} style={styles.weekdayLabel}>{w}</Text>
            ))}
          </View>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
                {week.map((d, di) => {
                if (!d) return <View key={di} style={[styles.dayCell, styles.dayCellInactive]} />;
                const iso = isoFromDate(d);
                const fest = festivalMap[iso];
                const hasFest = !!(fest && Array.isArray(fest.festivals) && fest.festivals.length > 0);
                // Use only the precomputed shortThidi when present; otherwise show nothing.
                const thidiShort = fest && fest.shortThidi ? String(fest.shortThidi) : '';
                return (
                  <View key={di} style={[styles.dayCell, hasFest ? styles.dayCellFestivalBg : null]}>
                    <Text style={[styles.dayCellDate, hasFest ? styles.dayCellFestivalText : {}]}>{d.getDate()}</Text>
                    <Text style={[styles.dayCellThidi, hasFest ? styles.dayCellFestivalText : {}]}>{thidiShort}</Text>
                  </View>
                )
              })}
            </View>
          ))}
        </View>
      </View>

      {/* Lower pane for this month's festivals */}
      <View style={styles.lowerFestivals}>
        <Text style={styles.monthFestivalsTitle}>పండుగలు</Text>
        <ScrollView>
          {monthFestivals.length === 0 && (
            <Text style={styles.noFestival}>No festivals this month.</Text>
          )}
          {monthFestivals.map(fd => {
            const m = String(fd.date || '').match(/\((\d{4}-\d{2}-\d{2})\)/);
            const iso = m ? m[1] : '';
            const displayDate = String(fd.date || '').replace(/\s*\(.+$/, '');
            return (
              <View key={iso} style={styles.rightItem}>
                <Text style={styles.rightItemDate}>{displayDate}:</Text>
                <Text style={styles.rightItemName}>{fd.festivals.join(', ')}</Text>
              </View>
            )
          })}
        </ScrollView>
      </View>
    </View>
  );
}

export default App;