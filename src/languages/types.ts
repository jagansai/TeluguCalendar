export type SupportedLanguage = 'te' | 'hi' | 'ta';

export type LanguageConfig = {
  code: SupportedLanguage;
  appTitle: string;
  widgetHintTitle: string;
  widgetHintBody: string;
  addWidget: string;
  notNow: string;
  today: string;
  year: string;
  thidi: string;
  festivals: string;
  upcoming: string;
  noFestivalData: string;
  notificationChannelName: string;
  notificationChannelDescription: string;
  notificationPermissionTitle: string;
  notificationPermissionMessage: string;
  notificationTitle: string;
  notificationToday: string;
  notificationNoFestivals: string;
  months: string[];
  weekdays: string[];
};
