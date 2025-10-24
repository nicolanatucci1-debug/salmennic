import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailyEntryForm } from '@/components/DailyEntryForm';
import { Dashboard } from '@/components/Dashboard';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { CalendarView } from '@/components/CalendarView';
import { useMentalHealthStore, useInitializeApp } from '@/store';
import { Heart, BarChart3, Calendar, Settings, Plus } from 'lucide-react';

const Index = () => {
  console.log('Index component starting to render');
  
  const [currentTab, setCurrentTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { initialize } = useInitializeApp();
  const { currentProfile, getEntryByDate, settings } = useMentalHealthStore();

  console.log('Store state:', { currentProfile, settings, showOnboarding });

  // Inizializza l'app al primo caricamento
  useEffect(() => {
    console.log('Initializing app...');
    initialize();
  }, []);

  // Mostra onboarding se necessario
  useEffect(() => {
    console.log('Checking onboarding:', { profilesLength: settings.profiles.length, isComplete: settings.isOnboardingComplete });
    if (settings.profiles.length === 0 || !settings.isOnboardingComplete) {
      console.log('Showing onboarding');
      setShowOnboarding(true);
    } else {
      console.log('Not showing onboarding');
      setShowOnboarding(false);
    }
  }, [settings.profiles.length, settings.isOnboardingComplete]);

  const handleOnboardingComplete = () => {
    console.log('Onboarding completed in Index');
    setShowOnboarding(false);
  };

  const todayEntry = getEntryByDate(selectedDate);
  const today = new Date().toISOString().split('T')[0];

  console.log('Render decision:', { showOnboarding, todayEntry });

  // Mostra onboarding se necessario
  if (showOnboarding) {
    console.log('Rendering onboarding');
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  console.log('Rendering main app');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-soft/5 to-therapeutic/5">
      {/* Header dell'app */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-calming">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">MindCare</h1>
                <p className="text-xs text-muted-foreground">
                  {currentProfile?.name || 'Caricamento...'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenuto principale */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          {/* Navigation tabs */}
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-card/50 backdrop-blur-sm">
              <TabsTrigger value="today" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Oggi</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Calendario</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Contenuti delle tab */}
          <TabsContent value="today" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              {/* Messaggio di benvenuto */}
              {!todayEntry && (
                <Card className="p-6 mb-6 bg-gradient-calming text-white">
                  <div className="text-center">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-90" />
                    <h2 className="text-2xl font-bold mb-2">Benvenuto in MindCare</h2>
                    <p className="text-white/90">
                      Inizia la tua giornata registrando il tuo stato d'animo. 
                      Ogni piccolo passo conta per il tuo benessere.
                    </p>
                  </div>
                </Card>
              )}

              {/* Form di inserimento giornaliero */}
              <DailyEntryForm 
                date={selectedDate} 
                existingEntry={todayEntry}
              />

              {/* Quick stats se c'è già una voce */}
              {todayEntry && (
                <Card className="p-6 bg-card/50 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold mb-4">Riepilogo di oggi</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl mb-1">{todayEntry.mood.emoji}</div>
                      <p className="text-sm text-muted-foreground">Umore: {todayEntry.mood.level}/5</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">🔍</div>
                      <p className="text-sm text-muted-foreground">{todayEntry.symptoms.length} sintomi</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">⚡</div>
                      <p className="text-sm text-muted-foreground">{todayEntry.triggers.length} trigger</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">🏃‍♂️</div>
                      <p className="text-sm text-muted-foreground">{todayEntry.activities.length} attività</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarView />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-card/30 backdrop-blur-sm border-t border-border/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              MindCare - Il tuo compagno per il benessere mentale
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Ricorda: questo strumento non sostituisce il supporto professionale
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
