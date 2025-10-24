import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useMentalHealthStore } from '@/store';
import { TimeRange } from '@/types';
import { TrendingUp, TrendingDown, Minus, Calendar, Brain, Heart, Activity } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const { getStats, getMoodTrend, getEntriesInRange, entries } = useMentalHealthStore();

  const stats = getStats(timeRange);
  const moodTrend = getMoodTrend(timeRange === 'week' ? 7 : 30);

  // Prepara dati per i grafici
  const getChartData = () => {
    const now = new Date();
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const relevantEntries = getEntriesInRange(
      startDate.toISOString().split('T')[0],
      now.toISOString().split('T')[0]
    );

    const chartData = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split('T')[0];
      const entry = relevantEntries.find(e => e.date === dateString);
      
      chartData.push({
        date: date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
        mood: entry?.mood.level || null,
        symptoms: entry?.symptoms.length || 0,
        triggers: entry?.triggers.length || 0,
        sleep: entry?.activities.find(a => a.type === 'sleep')?.value || null,
        exercise: entry?.activities.find(a => a.type === 'exercise')?.value || null,
      });
    }
    
    return chartData;
  };

  const chartData = getChartData();

  const getTrendIcon = () => {
    switch (moodTrend) {
      case 'improving':
        return <TrendingUp className="h-5 w-5 text-success" />;
      case 'declining':
        return <TrendingDown className="h-5 w-5 text-destructive" />;
      default:
        return <Minus className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (moodTrend) {
      case 'improving':
        return 'text-success';
      case 'declining':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTrendText = () => {
    switch (moodTrend) {
      case 'improving':
        return 'In miglioramento';
      case 'declining':
        return 'In calo';
      default:
        return 'Stabile';
    }
  };

  // Colori per i grafici
  const COLORS = {
    mood: 'hsl(var(--primary))',
    symptoms: 'hsl(var(--warning))',
    triggers: 'hsl(var(--destructive))',
    sleep: 'hsl(var(--therapeutic))',
    exercise: 'hsl(var(--success))',
  };

  return (
    <div className="space-y-6">
      {/* Header Dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Panoramica del tuo benessere mentale
          </p>
        </div>
        
        {/* Selezione periodo */}
        <div className="flex gap-2">
          {(['week', 'month', 'quarter'] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="capitalize"
            >
              {range === 'week' ? 'Settimana' : range === 'month' ? 'Mese' : 'Trimestre'}
            </Button>
          ))}
        </div>
      </div>

      {/* Cards statistiche principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary-soft/20">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Umore medio</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.moodAverage.toFixed(1)}/5
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-therapeutic/20">
              <div className="h-6 w-6 flex items-center justify-center">
                {getTrendIcon()}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tendenza</p>
              <p className={`text-xl font-semibold ${getTrendColor()}`}>
                {getTrendText()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-accent-soft/20">
              <Calendar className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Consistenza</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.consistencyScore}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-success/20">
              <Brain className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Voci totali</p>
              <p className="text-2xl font-bold text-foreground">
                {entries.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Grafici */}
      <Tabs defaultValue="mood" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mood">Umore</TabsTrigger>
          <TabsTrigger value="symptoms">Sintomi</TabsTrigger>
          <TabsTrigger value="activities">Attività</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="mood" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Andamento Umore</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    domain={[1, 5]} 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke={COLORS.mood}
                    strokeWidth={3}
                    dot={{ fill: COLORS.mood, strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: COLORS.mood, strokeWidth: 2, fill: 'hsl(var(--background))' }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="symptoms" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sintomi e Trigger nel tempo</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="symptoms" fill={COLORS.symptoms} name="Sintomi" />
                    <Bar dataKey="triggers" fill={COLORS.triggers} name="Trigger" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Sintomi</h3>
              <div className="space-y-3">
                {stats.topSymptoms.slice(0, 5).map((item, index) => (
                  <div key={item.symptom} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium">{item.symptom}</span>
                    <Badge variant="secondary">
                      {item.frequency} volte
                    </Badge>
                  </div>
                ))}
                {stats.topSymptoms.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nessun sintomo registrato in questo periodo
                  </p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sonno ed Esercizio</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sleep" 
                    stroke={COLORS.sleep}
                    strokeWidth={2}
                    name="Sonno (ore)"
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="exercise" 
                    stroke={COLORS.exercise}
                    strokeWidth={2}
                    name="Esercizio (min)"
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Trigger</h3>
              <div className="space-y-3">
                {stats.topTriggers.slice(0, 5).map((item, index) => (
                  <div key={item.trigger} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium">{item.trigger}</span>
                    <Badge variant="outline">
                      {item.frequency} volte
                    </Badge>
                  </div>
                ))}
                {stats.topTriggers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nessun trigger registrato in questo periodo
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Insights AI</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary-soft/10 border border-primary-soft/30">
                  <h4 className="font-semibold text-sm mb-2">🤖 Analisi Automatica</h4>
                  <p className="text-sm text-muted-foreground">
                    Basandomi sui tuoi dati, il tuo umore è {moodTrend === 'improving' ? 'in miglioramento' : moodTrend === 'declining' ? 'in calo' : 'stabile'} 
                    {stats.moodAverage > 3.5 && ' e mantieni un buon livello generale di benessere.'} 
                    {stats.consistencyScore > 70 && ' La tua consistenza nel tracciamento è ottima!'}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-therapeutic/10 border border-therapeutic/30">
                  <h4 className="font-semibold text-sm mb-2">💡 Suggerimenti</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {stats.moodAverage < 3 && <li>• Considera di parlare con un professionista</li>}
                    {stats.consistencyScore < 50 && <li>• Prova a essere più costante nel tracciamento</li>}
                    {stats.topTriggers.length > 0 && <li>• Lavora sui trigger più frequenti: {stats.topTriggers[0]?.trigger}</li>}
                    <li>• Continua a monitorare per identificare pattern</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};