import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DailyEntry, UserProfile, AppSettings, Symptom, Trigger, Activity, MoodLevel, StatsData, TimeRange } from '@/types';

// Store principale per l'app di salute mentale
interface MentalHealthStore {
  // Stato dell'app
  settings: AppSettings;
  currentProfile: UserProfile | null;
  entries: DailyEntry[];
  isLoading: boolean;
  lastUpdated: Date | null;

  // Actions per gestione profili
  createProfile: (profile: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  switchProfile: (profileId: string) => void;
  deleteProfile: (profileId: string) => void;
  completeOnboarding: () => void;

  // Actions per daily entries
  addDailyEntry: (entry: Omit<DailyEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDailyEntry: (entryId: string, updates: Partial<DailyEntry>) => void;
  deleteDailyEntry: (entryId: string) => void;
  getEntryByDate: (date: string) => DailyEntry | undefined;
  getEntriesInRange: (startDate: string, endDate: string) => DailyEntry[];

  // Actions per personalizzazione
  
  addCustomTrigger: (trigger: Omit<Trigger, 'id' | 'isCustom'>) => void;
  updateCustomTrigger: (triggerId: string, updates: Partial<Trigger>) => void;
  deleteCustomTrigger: (triggerId: string) => void;
  
  addCustomActivity: (activity: Omit<Activity, 'id' | 'isCustom'>) => void;
  updateCustomActivity: (activityId: string, updates: Partial<Activity>) => void;
  deleteCustomActivity: (activityId: string) => void;

  // Actions per statistiche
  getStats: (timeRange: TimeRange) => StatsData;
  getMoodTrend: (days: number) => 'improving' | 'stable' | 'declining';
  getTopSymptoms: (timeRange: TimeRange) => { symptom: string; frequency: number }[];
  getTopTriggers: (timeRange: TimeRange) => { trigger: string; frequency: number }[];

  // Actions utility
  exportData: () => string;
  importData: (data: string) => boolean;
  clearAllData: () => void;
  setLoading: (loading: boolean) => void;
}

// Sintomi predefiniti fissi (non modificabili) con scala 1-7
export const defaultSymptoms: Symptom[] = [
  { id: 'anxiety', name: 'Ansia', intensity: 1, color: '#FEF3C7', isCustom: false },
  { id: 'depression', name: 'Tristezza', intensity: 1, color: '#DBEAFE', isCustom: false },
  { id: 'stress', name: 'Stress', intensity: 1, color: '#FED7D7', isCustom: false },
  { id: 'fatigue', name: 'Stanchezza', intensity: 1, color: '#E9D8FD', isCustom: false },
  { id: 'irritability', name: 'Irritabilità', intensity: 1, color: '#FDBA74', isCustom: false },
  { id: 'concentration', name: 'Difficoltà concentrazione', intensity: 1, color: '#A7F3D0', isCustom: false },
  { id: 'panic', name: 'Attacchi di panico', intensity: 1, color: '#F87171', isCustom: false },
  { id: 'mood-swings', name: 'Sbalzi d\'umore', intensity: 1, color: '#C084FC', isCustom: false },
  { id: 'insomnia', name: 'Insonnia', intensity: 1, color: '#60A5FA', isCustom: false },
  { id: 'social-anxiety', name: 'Ansia sociale', intensity: 1, color: '#34D399', isCustom: false },
];

export const defaultTriggers: Trigger[] = [
  { id: 'work-stress', name: 'Stress lavorativo', category: 'work', isCustom: false },
  { id: 'social-interaction', name: 'Interazioni sociali', category: 'social', isCustom: false },
  { id: 'lack-sleep', name: 'Mancanza di sonno', category: 'health', isCustom: false },
  { id: 'family-issues', name: 'Problemi familiari', category: 'social', isCustom: false },
  { id: 'financial-worry', name: 'Preoccupazioni finanziarie', category: 'stress', isCustom: false },
  { id: 'relationship', name: 'Relazioni interpersonali', category: 'social', isCustom: false },
  { id: 'health-issues', name: 'Problemi di salute', category: 'health', isCustom: false },
  { id: 'change', name: 'Cambiamenti improvvisi', category: 'stress', isCustom: false },
];

export const defaultActivities: Activity[] = [
  { id: 'sleep', name: 'Sonno', type: 'sleep', value: 8, unit: 'ore', isCustom: false },
  { id: 'exercise', name: 'Esercizio fisico', type: 'exercise', value: 30, unit: 'minuti', isCustom: false },
  { id: 'meditation', name: 'Meditazione', type: 'custom', value: 15, unit: 'minuti', isCustom: false },
  { id: 'social-time', name: 'Tempo sociale', type: 'social', value: 2, unit: 'ore', isCustom: false },
];

// Genera ID univoci
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Crea profilo predefinito
const createDefaultProfile = (): UserProfile => ({
  id: generateId(),
  name: 'Il mio profilo',
  preferences: {
    theme: 'light',
    reminderTime: '20:00',
    enableNotifications: true,
    notificationPermission: 'default',
    colorblindMode: false,
    highContrast: false,
    fontSize: 'medium',
    autoTheme: false,
  },
  customTriggers: [],
  customActivities: [],
  createdAt: new Date(),
});

// Store principale
export const useMentalHealthStore = create<MentalHealthStore>()(
  persist(
    (set, get) => ({
      // Stato iniziale
      settings: {
        currentProfileId: '',
        profiles: [],
        isOnboardingComplete: false,
        lastSync: null,
      },
      currentProfile: null,
      entries: [],
      isLoading: false,
      lastUpdated: null,

      // Gestione profili
      createProfile: (profileData) => {
        const newProfile = {
          ...profileData,
          id: generateId(),
          createdAt: new Date(),
        };
        
        set((state) => ({
          settings: {
            ...state.settings,
            profiles: [...state.settings.profiles, newProfile],
            currentProfileId: newProfile.id,
          },
          currentProfile: newProfile,
        }));
      },

      updateProfile: (updates) => {
        const state = get();
        if (!state.currentProfile) return;

        const updatedProfile = { ...state.currentProfile, ...updates };
        
        set((state) => ({
          settings: {
            ...state.settings,
            profiles: state.settings.profiles.map(p => 
              p.id === updatedProfile.id ? updatedProfile : p
            ),
          },
          currentProfile: updatedProfile,
        }));
      },

      switchProfile: (profileId) => {
        const state = get();
        const profile = state.settings.profiles.find(p => p.id === profileId);
        
        if (profile) {
          set((state) => ({
            settings: {
              ...state.settings,
              currentProfileId: profileId,
            },
            currentProfile: profile,
          }));
        }
      },

      deleteProfile: (profileId) => {
        set((state) => {
          const remainingProfiles = state.settings.profiles.filter(p => p.id !== profileId);
          const newCurrentProfile = remainingProfiles.length > 0 ? remainingProfiles[0] : null;
          
          return {
            settings: {
              ...state.settings,
              profiles: remainingProfiles,
              currentProfileId: newCurrentProfile?.id || '',
            },
            currentProfile: newCurrentProfile,
            entries: state.entries.filter(e => e.id !== profileId), // Rimuovi entries del profilo cancellato
          };
        });
      },

      completeOnboarding: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            isOnboardingComplete: true,
          },
        }));
      },

      // Gestione daily entries
      addDailyEntry: (entryData) => {
        const newEntry: DailyEntry = {
          ...entryData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          entries: [...state.entries.filter(e => e.date !== entryData.date), newEntry], // Sostituisci se esiste già per quella data
          lastUpdated: new Date(),
        }));
      },

      updateDailyEntry: (entryId, updates) => {
        set((state) => ({
          entries: state.entries.map(entry =>
            entry.id === entryId 
              ? { ...entry, ...updates, updatedAt: new Date() }
              : entry
          ),
          lastUpdated: new Date(),
        }));
      },

      deleteDailyEntry: (entryId) => {
        set((state) => ({
          entries: state.entries.filter(entry => entry.id !== entryId),
          lastUpdated: new Date(),
        }));
      },

      getEntryByDate: (date) => {
        const state = get();
        return state.entries.find(entry => entry.date === date);
      },

      getEntriesInRange: (startDate, endDate) => {
        const state = get();
        return state.entries.filter(entry => 
          entry.date >= startDate && entry.date <= endDate
        ).sort((a, b) => a.date.localeCompare(b.date));
      },

      // Personalizzazione - solo trigger e attività, i sintomi sono fissi

      // Trigger personalizzati
      addCustomTrigger: (triggerData) => {
        const newTrigger: Trigger = {
          ...triggerData,
          id: generateId(),
          isCustom: true,
        };

        set((state) => {
          if (!state.currentProfile) return state;
          
          const updatedProfile = {
            ...state.currentProfile,
            customTriggers: [...state.currentProfile.customTriggers, newTrigger],
          };

          return {
            currentProfile: updatedProfile,
            settings: {
              ...state.settings,
              profiles: state.settings.profiles.map(p => 
                p.id === updatedProfile.id ? updatedProfile : p
              ),
            },
          };
        });
      },

      updateCustomTrigger: (triggerId, updates) => {
        set((state) => {
          if (!state.currentProfile) return state;
          
          const updatedProfile = {
            ...state.currentProfile,
            customTriggers: state.currentProfile.customTriggers.map(t =>
              t.id === triggerId ? { ...t, ...updates } : t
            ),
          };

          return {
            currentProfile: updatedProfile,
            settings: {
              ...state.settings,
              profiles: state.settings.profiles.map(p => 
                p.id === updatedProfile.id ? updatedProfile : p
              ),
            },
          };
        });
      },

      deleteCustomTrigger: (triggerId) => {
        set((state) => {
          if (!state.currentProfile) return state;
          
          const updatedProfile = {
            ...state.currentProfile,
            customTriggers: state.currentProfile.customTriggers.filter(t => t.id !== triggerId),
          };

          return {
            currentProfile: updatedProfile,
            settings: {
              ...state.settings,
              profiles: state.settings.profiles.map(p => 
                p.id === updatedProfile.id ? updatedProfile : p
              ),
            },
          };
        });
      },

      // Attività personalizzate
      addCustomActivity: (activityData) => {
        const newActivity: Activity = {
          ...activityData,
          id: generateId(),
          isCustom: true,
        };

        set((state) => {
          if (!state.currentProfile) return state;
          
          const updatedProfile = {
            ...state.currentProfile,
            customActivities: [...state.currentProfile.customActivities, newActivity],
          };

          return {
            currentProfile: updatedProfile,
            settings: {
              ...state.settings,
              profiles: state.settings.profiles.map(p => 
                p.id === updatedProfile.id ? updatedProfile : p
              ),
            },
          };
        });
      },

      updateCustomActivity: (activityId, updates) => {
        set((state) => {
          if (!state.currentProfile) return state;
          
          const updatedProfile = {
            ...state.currentProfile,
            customActivities: state.currentProfile.customActivities.map(a =>
              a.id === activityId ? { ...a, ...updates } : a
            ),
          };

          return {
            currentProfile: updatedProfile,
            settings: {
              ...state.settings,
              profiles: state.settings.profiles.map(p => 
                p.id === updatedProfile.id ? updatedProfile : p
              ),
            },
          };
        });
      },

      deleteCustomActivity: (activityId) => {
        set((state) => {
          if (!state.currentProfile) return state;
          
          const updatedProfile = {
            ...state.currentProfile,
            customActivities: state.currentProfile.customActivities.filter(a => a.id !== activityId),
          };

          return {
            currentProfile: updatedProfile,
            settings: {
              ...state.settings,
              profiles: state.settings.profiles.map(p => 
                p.id === updatedProfile.id ? updatedProfile : p
              ),
            },
          };
        });
      },

      // Statistiche
      getStats: (timeRange) => {
        const state = get();
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'quarter':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case 'year':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
        }

        const relevantEntries = state.entries.filter(entry => 
          new Date(entry.date) >= startDate
        );

        const moodAverage = relevantEntries.length > 0 
          ? relevantEntries.reduce((sum, entry) => sum + entry.mood.level, 0) / relevantEntries.length
          : 0;

        const moodTrend = get().getMoodTrend(timeRange === 'week' ? 7 : 30);
        const topSymptoms = get().getTopSymptoms(timeRange);
        const topTriggers = get().getTopTriggers(timeRange);
        
        const consistencyScore = Math.round((relevantEntries.length / (timeRange === 'week' ? 7 : 30)) * 100);

        return {
          moodAverage,
          moodTrend,
          topSymptoms,
          topTriggers,
          consistencyScore,
        };
      },

      getMoodTrend: (days) => {
        const state = get();
        const now = new Date();
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        
        const entries = state.entries
          .filter(entry => new Date(entry.date) >= startDate)
          .sort((a, b) => a.date.localeCompare(b.date));

        if (entries.length < 3) return 'stable';

        const firstHalf = entries.slice(0, Math.floor(entries.length / 2));
        const secondHalf = entries.slice(Math.floor(entries.length / 2));

        const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.mood.level, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.mood.level, 0) / secondHalf.length;

        const difference = secondAvg - firstAvg;
        
        if (difference > 0.3) return 'improving';
        if (difference < -0.3) return 'declining';
        return 'stable';
      },

      getTopSymptoms: (timeRange) => {
        const state = get();
        const relevantEntries = get().getEntriesInRange(
          new Date(Date.now() - (timeRange === 'week' ? 7 : 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        );

        const symptomCount: Record<string, number> = {};
        
        relevantEntries.forEach(entry => {
          entry.symptoms.forEach(symptom => {
            symptomCount[symptom.name] = (symptomCount[symptom.name] || 0) + 1;
          });
        });

        return Object.entries(symptomCount)
          .map(([symptom, frequency]) => ({ symptom, frequency }))
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, 5);
      },

      getTopTriggers: (timeRange) => {
        const state = get();
        const relevantEntries = get().getEntriesInRange(
          new Date(Date.now() - (timeRange === 'week' ? 7 : 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        );

        const triggerCount: Record<string, number> = {};
        
        relevantEntries.forEach(entry => {
          entry.triggers.forEach(trigger => {
            triggerCount[trigger.name] = (triggerCount[trigger.name] || 0) + 1;
          });
        });

        return Object.entries(triggerCount)
          .map(([trigger, frequency]) => ({ trigger, frequency }))
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, 5);
      },

      // Utility
      exportData: () => {
        const state = get();
        return JSON.stringify({
          settings: state.settings,
          entries: state.entries,
          exportDate: new Date().toISOString(),
        });
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.settings && parsed.entries) {
            set({
              settings: parsed.settings,
              entries: parsed.entries,
              currentProfile: parsed.settings.profiles.find((p: UserProfile) => p.id === parsed.settings.currentProfileId) || null,
              lastUpdated: new Date(),
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      clearAllData: () => {
        const defaultProfile = createDefaultProfile();
        set({
          settings: {
            currentProfileId: defaultProfile.id,
            profiles: [defaultProfile],
            isOnboardingComplete: false,
            lastSync: null,
          },
          currentProfile: defaultProfile,
          entries: [],
          lastUpdated: new Date(),
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'mental-health-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
        entries: state.entries,
      }),
    }
  )
);

// Hook per inizializzare l'app con dati predefiniti
export const useInitializeApp = () => {
  const store = useMentalHealthStore();
  
  const initialize = () => {
    console.log('Initialize function called');
    console.log('Current store state:', store.settings);
    
    if (store.settings.profiles.length === 0) {
      console.log('No profiles found, creating default profile');
      const defaultProfile = createDefaultProfile();
      store.createProfile(defaultProfile);
      console.log('Default profile created:', defaultProfile);
    } else {
      console.log('Profiles exist:', store.settings.profiles);
    }
    
    if (!store.currentProfile && store.settings.profiles.length > 0) {
      console.log('No current profile, switching to first profile');
      store.switchProfile(store.settings.profiles[0].id);
    }
  };

  return { initialize };
};
