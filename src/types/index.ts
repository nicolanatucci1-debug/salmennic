// Types per l'app di monitoraggio salute mentale

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  level: MoodLevel;
  emoji: string;
  timestamp: Date;
}

export interface Symptom {
  id: string;
  name: string;
  intensity: 1 | 2 | 3 | 4 | 5 | 6 | 7; // Scala fissa da 1 a 7
  color: string;
  isCustom: false; // Sintomi non modificabili dall'utente
}

export interface Trigger {
  id: string;
  name: string;
  category: 'stress' | 'social' | 'work' | 'health' | 'environment' | 'custom';
  isCustom: boolean;
}

export interface Activity {
  id: string;
  name: string;
  type: 'sleep' | 'exercise' | 'social' | 'nutrition' | 'custom';
  value: number; // ore per sonno, minuti per esercizio, ecc.
  unit: string;
  isCustom: boolean;
}

export interface WeatherData {
  id: string;
  condition: 'soleggiato' | 'nuvoloso' | 'pioggia' | 'temporale' | 'neve' | 'nebbia' | 'ventoso';
  temperature?: number;
  humidity?: number;
}

export interface DailyEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  mood: MoodEntry;
  symptoms: Symptom[];
  triggers: Trigger[];
  activities: Activity[];
  weather: WeatherData | null; // Meteo come dato separato
  screenTime: number; // Tempo di utilizzo in minuti
  dayRating: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10; // Stima complessiva della giornata
  notes: string;
  aiSummary?: string; // Resoconto AI della giornata
  aiAdvice?: string; // Consigli AI
  aiTask?: string; // Compito suggerito per l'indomani
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    reminderTime: string;
    enableNotifications: boolean;
    notificationPermission?: 'granted' | 'denied' | 'default';
    colorblindMode: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    autoTheme: boolean; // Tema notturno automatico
  };
  customTriggers: Trigger[];
  customActivities: Activity[];
  createdAt: Date;
}

export interface AppSettings {
  currentProfileId: string;
  profiles: UserProfile[];
  isOnboardingComplete: boolean;
  lastSync: Date | null;
}

export interface StatsData {
  moodAverage: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  topSymptoms: { symptom: string; frequency: number }[];
  topTriggers: { trigger: string; frequency: number }[];
  consistencyScore: number; // 0-100
}

export type TimeRange = 'week' | 'month' | 'quarter' | 'year';

export interface ChartData {
  date: string;
  mood: number;
  symptoms: number;
  triggers: number;
  sleep?: number;
  exercise?: number;
}