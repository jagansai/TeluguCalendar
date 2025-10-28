export function formatTeluguDateFromIso(iso: string): string {
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
