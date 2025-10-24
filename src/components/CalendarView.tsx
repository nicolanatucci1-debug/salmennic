import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMentalHealthStore } from '@/store';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { entries, getEntryByDate } = useMentalHealthStore();

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const getMoodColor = (moodLevel: number) => {
    switch (moodLevel) {
      case 1: return 'bg-destructive';
      case 2: return 'bg-warning';
      case 3: return 'bg-muted';
      case 4: return 'bg-primary-soft';
      case 5: return 'bg-success';
      default: return 'bg-transparent';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();
    
    // Giorni vuoti prima del primo giorno del mese
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Giorni del mese
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entry = getEntryByDate(dateString);
      const isToday = today.toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

      days.push(
        <div
          key={day}
          className={`
            h-12 flex items-center justify-center text-sm font-medium cursor-pointer
            transition-all hover:scale-105 rounded-lg relative
            ${isToday ? 'ring-2 ring-primary' : ''}
            ${entry ? getMoodColor(entry.mood.level) : 'hover:bg-muted/50'}
          `}
        >
          <span className={entry ? 'text-white' : 'text-foreground'}>
            {day}
          </span>
          {entry && (
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs text-white">✓</span>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        {/* Header calendario */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Giorni della settimana */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Griglia calendario */}
        <div className="grid grid-cols-7 gap-2">
          {renderCalendarDays()}
        </div>

        {/* Legenda */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h3 className="text-sm font-semibold mb-3">Legenda</h3>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-destructive text-white">😢 Molto male</Badge>
            <Badge className="bg-warning text-white">😔 Male</Badge>
            <Badge className="bg-muted text-foreground">😐 Neutro</Badge>
            <Badge className="bg-primary-soft text-white">🙂 Bene</Badge>
            <Badge className="bg-success text-white">😊 Molto bene</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            I giorni con il segno ✓ hanno una voce registrata
          </p>
        </div>
      </Card>

      {/* Statistiche mensili */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Statistiche di {monthNames[currentDate.getMonth()]}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {entries.filter(e => e.date.startsWith(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`)).length}
            </div>
            <p className="text-sm text-muted-foreground">Giorni registrati</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              {Math.round((entries.filter(e => e.date.startsWith(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`)).length / daysInMonth) * 100)}%
            </div>
            <p className="text-sm text-muted-foreground">Consistenza</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-therapeutic">
              {entries.filter(e => e.date.startsWith(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`))
                .reduce((acc, e) => acc + e.mood.level, 0) / Math.max(1, entries.filter(e => e.date.startsWith(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`)).length) || 0}
            </div>
            <p className="text-sm text-muted-foreground">Umore medio</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {entries.filter(e => e.date.startsWith(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`))
                .reduce((acc, e) => acc + e.symptoms.length, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Tot. sintomi</p>
          </div>
        </div>
      </Card>
    </div>
  );
};