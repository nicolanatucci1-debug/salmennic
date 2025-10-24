import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MoodLevel } from '@/types';

interface MoodSelectorProps {
  value: MoodLevel | null;
  onChange: (mood: MoodLevel, emoji: string) => void;
  className?: string;
}

const moodOptions = [
  { level: 1 as MoodLevel, emoji: '😢', label: 'Molto male', color: 'bg-destructive/20 hover:bg-destructive/30' },
  { level: 2 as MoodLevel, emoji: '😔', label: 'Male', color: 'bg-warning/20 hover:bg-warning/30' },
  { level: 3 as MoodLevel, emoji: '😐', label: 'Neutro', color: 'bg-muted hover:bg-muted/80' },
  { level: 4 as MoodLevel, emoji: '🙂', label: 'Bene', color: 'bg-primary-soft/30 hover:bg-primary-soft/40' },
  { level: 5 as MoodLevel, emoji: '😊', label: 'Molto bene', color: 'bg-success/20 hover:bg-success/30' },
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({ value, onChange, className }) => {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Come ti senti oggi?
          </h3>
          <p className="text-sm text-muted-foreground">
            Seleziona il tuo umore attuale su una scala da 1 a 5
          </p>
        </div>
        
        <div className="grid grid-cols-5 gap-3">
          {moodOptions.map((mood) => (
            <Button
              key={mood.level}
              variant={value === mood.level ? "default" : "ghost"}
              onClick={() => onChange(mood.level, mood.emoji)}
              className={`
                h-20 flex-col gap-2 transition-all duration-300 focus-soft
                ${value === mood.level ? 'ring-2 ring-primary shadow-glow' : ''}
                ${mood.color}
              `}
            >
              <span className="text-2xl" role="img" aria-label={mood.label}>
                {mood.emoji}
              </span>
              <span className="text-xs font-medium text-center leading-tight">
                {mood.label}
              </span>
            </Button>
          ))}
        </div>
        
        {value && (
          <div className="mt-4 p-3 rounded-lg bg-primary-soft/10 border border-primary-soft/30">
            <p className="text-sm text-foreground text-center">
              Hai selezionato: <strong>{moodOptions.find(m => m.level === value)?.label}</strong>
              <span className="ml-2 text-lg">
                {moodOptions.find(m => m.level === value)?.emoji}
              </span>
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};