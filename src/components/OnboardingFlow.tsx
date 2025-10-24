import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useMentalHealthStore, defaultSymptoms, defaultTriggers } from '@/store';
import { Heart, ArrowRight, CheckCircle, Brain, Activity, Target } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  console.log('OnboardingFlow component rendering');
  
  const [step, setStep] = useState(1);
  const [profileName, setProfileName] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [enableNotifications, setEnableNotifications] = useState(true);
  
  const { createProfile, completeOnboarding } = useMentalHealthStore();

  const predefinedConditions = [
    { id: 'anxiety', name: 'Ansia', icon: '😰', color: 'bg-warning/20' },
    { id: 'depression', name: 'Depressione', icon: '😔', color: 'bg-secondary/20' },
    { id: 'stress', name: 'Stress', icon: '😤', color: 'bg-destructive/20' },
    { id: 'bipolar', name: 'Disturbo Bipolare', icon: '🎭', color: 'bg-accent/20' },
    { id: 'adhd', name: 'ADHD', icon: '🎯', color: 'bg-therapeutic/20' },
    { id: 'general', name: 'Benessere Generale', icon: '🌟', color: 'bg-success/20' },
  ];

  const handleConditionToggle = (conditionId: string) => {
    setSelectedConditions(prev => 
      prev.includes(conditionId) 
        ? prev.filter(id => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  const handleComplete = () => {
    console.log('Creating profile and completing onboarding');
    
    const newProfile = {
      name: profileName || 'Il mio profilo',
      preferences: {
        theme: 'light' as const,
        reminderTime,
        enableNotifications,
        notificationPermission: 'default' as const,
        colorblindMode: false,
        highContrast: false,
        fontSize: 'medium' as const,
        autoTheme: false,
      },
      customTriggers: [],
      customActivities: [],
    };

    createProfile(newProfile);
    completeOnboarding(); // Marca l'onboarding come completato
    
    console.log('Profile created and onboarding completed');
    onComplete();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="p-8 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="p-4 rounded-full bg-gradient-calming inline-block mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Benvenuto in MindCare</h2>
              <p className="text-muted-foreground">
                Il tuo compagno digitale per il benessere mentale
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Come vuoi essere chiamato?</Label>
                <Input
                  id="name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Il tuo nome o nickname"
                  className="mt-1"
                />
              </div>

              <Button 
                onClick={() => setStep(2)} 
                className="w-full"
                disabled={!profileName.trim()}
              >
                Continua
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Card>
        );

      case 2:
        return (
          <Card className="p-8 max-w-lg mx-auto">
            <div className="text-center mb-6">
              <div className="p-4 rounded-full bg-therapeutic/20 inline-block mb-4">
                <Brain className="h-8 w-8 text-therapeutic" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Personalizza la tua esperienza</h2>
              <p className="text-muted-foreground">
                Seleziona le aree che vuoi monitorare (opzionale)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {predefinedConditions.map(condition => (
                <div
                  key={condition.id}
                  onClick={() => handleConditionToggle(condition.id)}
                  className={`
                    p-4 rounded-lg border cursor-pointer transition-all
                    ${selectedConditions.includes(condition.id) 
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                      : 'border-border hover:border-primary/50'
                    }
                    ${condition.color}
                  `}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{condition.icon}</div>
                    <p className="text-sm font-medium">{condition.name}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Indietro
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Continua
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card className="p-8 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="p-4 rounded-full bg-accent/20 inline-block mb-4">
                <Activity className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Impostazioni finali</h2>
              <p className="text-muted-foreground">
                Configura i promemoria per mantenerti costante
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifications"
                  checked={enableNotifications}
                  onCheckedChange={(checked) => setEnableNotifications(checked === true)}
                />
                <Label htmlFor="notifications" className="text-sm">
                  Abilita promemoria giornalieri
                </Label>
              </div>

              {enableNotifications && (
                <div>
                  <Label htmlFor="time">Orario promemoria</Label>
                  <Input
                    id="time"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Indietro
                </Button>
                <Button onClick={handleComplete} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Inizia
                </Button>
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-soft/5 to-therapeutic/5 flex items-center justify-center p-4">
      {/* Progress indicator */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div className="flex gap-2">
          {[1, 2, 3].map(stepNumber => (
            <div
              key={stepNumber}
              className={`
                w-3 h-3 rounded-full transition-all
                ${stepNumber <= step ? 'bg-primary' : 'bg-muted'}
              `}
            />
          ))}
        </div>
      </div>

      {renderStep()}
    </div>
  );
};