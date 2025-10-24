import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoodSelector } from './MoodSelector';
import { useMentalHealthStore, defaultSymptoms, defaultTriggers, defaultActivities } from '@/store';
import { AIAnalysis } from './AIAnalysis';
import { DailyEntry, MoodLevel, Symptom, Trigger, Activity, WeatherData } from '@/types';
import { Plus, X, Save, Calendar, Cloud, Star, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DailyEntryFormProps {
  date: string; // YYYY-MM-DD format
  existingEntry?: DailyEntry;
  onSave?: (entry: DailyEntry) => void;
}

export const DailyEntryForm: React.FC<DailyEntryFormProps> = ({ 
  date, 
  existingEntry, 
  onSave 
}) => {
  const { toast } = useToast();
  const { addDailyEntry, updateDailyEntry, currentProfile } = useMentalHealthStore();
  
  // Stato del form
  const [mood, setMood] = useState<{ level: MoodLevel; emoji: string } | null>(
    existingEntry ? existingEntry.mood : null
  );
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>(
    existingEntry?.symptoms || []
  );
  const [selectedTriggers, setSelectedTriggers] = useState<Trigger[]>(
    existingEntry?.triggers || []
  );
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>(
    existingEntry?.activities || []
  );
  const [weather, setWeather] = useState<WeatherData | null>(
    existingEntry?.weather || null
  );
  const [screenTime, setScreenTime] = useState<number>(
    existingEntry?.screenTime || 0
  );
  const [dayRating, setDayRating] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>(
    existingEntry?.dayRating || 5
  );
  const [notes, setNotes] = useState(existingEntry?.notes || '');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [savedEntry, setSavedEntry] = useState<DailyEntry | null>(null);

  // Sintomi fissi predefiniti
  const allSymptoms = defaultSymptoms;

  const allTriggers = [
    ...defaultTriggers,
    ...(currentProfile?.customTriggers || [])
  ];

  const allActivities = [
    ...defaultActivities,
    ...(currentProfile?.customActivities || [])
  ];

  const handleMoodChange = (level: MoodLevel, emoji: string) => {
    setMood({ level, emoji });
  };

  const handleSymptomToggle = (symptom: Symptom) => {
    setSelectedSymptoms(prev => {
      const exists = prev.find(s => s.id === symptom.id);
      if (exists) {
        return prev.filter(s => s.id !== symptom.id);
      } else {
        return [...prev, { ...symptom, intensity: 3 }];
      }
    });
  };

  const handleSymptomIntensityChange = (symptomId: string, intensity: number) => {
    setSelectedSymptoms(prev =>
      prev.map(s => 
        s.id === symptomId 
          ? { ...s, intensity: intensity as 1 | 2 | 3 | 4 | 5 | 6 | 7 }
          : s
      )
    );
  };

  const handleTriggerToggle = (trigger: Trigger) => {
    setSelectedTriggers(prev => {
      const exists = prev.find(t => t.id === trigger.id);
      if (exists) {
        return prev.filter(t => t.id !== trigger.id);
      } else {
        return [...prev, trigger];
      }
    });
  };

  const handleActivityToggle = (activity: Activity) => {
    setSelectedActivities(prev => {
      const exists = prev.find(a => a.id === activity.id);
      if (exists) {
        return prev.filter(a => a.id !== activity.id);
      } else {
        return [...prev, activity];
      }
    });
  };

  const handleActivityValueChange = (activityId: string, value: number) => {
    setSelectedActivities(prev =>
      prev.map(a => 
        a.id === activityId 
          ? { ...a, value }
          : a
      )
    );
  };

  const handleSave = () => {
    if (!mood) {
      toast({
        title: "Umore richiesto",
        description: "Seleziona il tuo umore prima di salvare",
        variant: "destructive",
      });
      return;
    }

    const entryData = {
      date,
      mood: {
        level: mood.level,
        emoji: mood.emoji,
        timestamp: new Date(),
      },
      symptoms: selectedSymptoms,
      triggers: selectedTriggers,
      activities: selectedActivities,
      weather,
      screenTime,
      dayRating,
      notes: notes.trim(),
    };

    if (existingEntry) {
      updateDailyEntry(existingEntry.id, entryData);
      toast({
        title: "Voce aggiornata",
        description: "I tuoi dati sono stati salvati con successo",
      });
    } else {
      addDailyEntry(entryData);
      toast({
        title: "Voce salvata",
        description: "I tuoi dati giornalieri sono stati registrati",
      });
    }

    const fullEntry = { ...entryData, id: existingEntry?.id || generateId(), createdAt: new Date(), updatedAt: new Date() };
    setSavedEntry(fullEntry);
    setShowAIAnalysis(true);
    onSave && onSave(fullEntry);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const handleAIAnalysisComplete = (analysis: { summary: string; advice: string; task: string }) => {
    if (savedEntry) {
      // Aggiorna l'entry con l'analisi AI
      const updatedEntry = {
        ...savedEntry,
        aiSummary: analysis.summary,
        aiAdvice: analysis.advice,
        aiTask: analysis.task,
      };
      
      if (existingEntry) {
        updateDailyEntry(existingEntry.id, updatedEntry);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con data */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Monitoraggio giornaliero
            </h2>
            <p className="text-sm text-muted-foreground capitalize">
              {formatDate(date)}
            </p>
          </div>
        </div>
      </Card>

      {/* Selezione umore */}
      <MoodSelector 
        value={mood?.level || null} 
        onChange={handleMoodChange}
      />

      {/* Sezioni aggiuntive (espandibili) */}
      <Card className="p-6">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between p-0 h-auto text-left"
        >
          <span className="text-lg font-semibold">
            Dettagli aggiuntivi (opzionale)
          </span>
          <span className={`transform transition-transform ${isExpanded ? 'rotate-45' : ''}`}>
            <Plus className="h-5 w-5" />
          </span>
        </Button>

        {isExpanded && (
          <div className="mt-6 space-y-6 animate-slide-down">
            {/* Sintomi */}
            <div>
              <h3 className="text-md font-semibold mb-3">Sintomi</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {allSymptoms.map(symptom => (
                  <Badge
                    key={symptom.id}
                    variant={selectedSymptoms.find(s => s.id === symptom.id) ? "default" : "outline"}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => handleSymptomToggle(symptom)}
                  >
                    {symptom.name}
                    {selectedSymptoms.find(s => s.id === symptom.id) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>

              {/* Intensità sintomi selezionati */}
              {selectedSymptoms.map(symptom => (
                <div key={symptom.id} className="mb-4 p-3 rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{symptom.name}</span>
                     <span className="text-sm text-muted-foreground">
                       Intensità: {symptom.intensity}/7
                     </span>
                  </div>
                   <Slider
                     value={[symptom.intensity]}
                     onValueChange={([value]) => handleSymptomIntensityChange(symptom.id, value)}
                     min={1}
                     max={7}
                     step={1}
                     className="w-full"
                   />
                </div>
              ))}
            </div>

            {/* Fattori scatenanti */}
            <div>
              <h3 className="text-md font-semibold mb-3">Fattori scatenanti</h3>
              <div className="flex flex-wrap gap-2">
                {allTriggers.map(trigger => (
                  <Badge
                    key={trigger.id}
                    variant={selectedTriggers.find(t => t.id === trigger.id) ? "default" : "outline"}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => handleTriggerToggle(trigger)}
                  >
                    {trigger.name}
                    {selectedTriggers.find(t => t.id === trigger.id) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Attività */}
            <div>
              <h3 className="text-md font-semibold mb-3">Attività quotidiane</h3>
              <div className="space-y-3">
                {allActivities.map(activity => {
                  const isSelected = selectedActivities.find(a => a.id === activity.id);
                  return (
                    <div 
                      key={activity.id} 
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-primary bg-primary-soft/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleActivityToggle(activity)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{activity.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {isSelected ? `${isSelected.value} ${activity.unit}` : `${activity.value} ${activity.unit}`}
                        </span>
                      </div>
                      
                      {isSelected && (
                        <div className="mt-2">
                          <Slider
                            value={[isSelected.value]}
                            onValueChange={([value]) => handleActivityValueChange(activity.id, value)}
                            min={0}
                            max={activity.type === 'sleep' ? 12 : activity.type === 'exercise' ? 180 : 8}
                            step={activity.type === 'sleep' ? 0.5 : activity.type === 'exercise' ? 15 : 0.5}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Meteo */}
            <div>
              <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Condizioni meteo
              </h3>
              <Select
                value={weather?.condition || ""}
                onValueChange={(value) => setWeather(value ? { 
                  id: Date.now().toString(), 
                  condition: value as WeatherData['condition'] 
                } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona condizione meteo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="soleggiato">☀️ Soleggiato</SelectItem>
                  <SelectItem value="nuvoloso">☁️ Nuvoloso</SelectItem>
                  <SelectItem value="pioggia">🌧️ Pioggia</SelectItem>
                  <SelectItem value="temporale">⛈️ Temporale</SelectItem>
                  <SelectItem value="neve">❄️ Neve</SelectItem>
                  <SelectItem value="nebbia">🌫️ Nebbia</SelectItem>
                  <SelectItem value="ventoso">💨 Ventoso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Screen Time */}
            <div>
              <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Tempo di utilizzo schermo
              </h3>
              <div className="space-y-2">
                <Label>Ore giornaliere: {(screenTime / 60).toFixed(1)}h</Label>
                <Slider
                  value={[screenTime]}
                  onValueChange={([value]) => setScreenTime(value)}
                  min={0}
                  max={1440} // 24 ore in minuti
                  step={15}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Da 0 a 24 ore (incrementi di 15 min)
                </p>
              </div>
            </div>

            {/* Valutazione complessiva giornata */}
            <div>
              <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Valutazione complessiva della giornata
              </h3>
              <div className="space-y-2">
                <Label>Voto: {dayRating}/10</Label>
                <Slider
                  value={[dayRating]}
                  onValueChange={([value]) => setDayRating(value as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Come valuti complessivamente questa giornata? (1-10)
                </p>
              </div>
            </div>

            {/* Note */}
            <div>
              <h3 className="text-md font-semibold mb-3">Note personali</h3>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Aggiungi eventuali note sulla tua giornata, traguardi raggiunti, piccole cose che ti hanno reso felice, preoccupazioni etc..."
                className="min-h-[80px] focus-soft"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {notes.length}/500 caratteri
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Pulsante salvataggio */}
      <Button
        onClick={handleSave}
        className="w-full h-12 text-lg font-semibold"
        disabled={!mood}
      >
        <Save className="h-5 w-5 mr-2" />
        {existingEntry ? 'Aggiorna voce' : 'Salva voce giornaliera'}
      </Button>

      {/* Analisi AI - Mostra dopo il salvataggio */}
      {showAIAnalysis && savedEntry && (
        <AIAnalysis 
          entry={savedEntry} 
          onAnalysisComplete={handleAIAnalysisComplete}
        />
      )}
    </div>
  );
};