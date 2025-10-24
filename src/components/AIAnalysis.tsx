import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DailyEntry } from '@/types';
import { Brain, Lightbulb, Target, Moon, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIAnalysisProps {
  entry: DailyEntry;
  onAnalysisComplete?: (analysis: {
    summary: string;
    advice: string;
    task: string;
  }) => void;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ 
  entry, 
  onAnalysisComplete 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    summary: string;
    advice: string;
    task: string;
  } | null>(null);

  const generateAnalysis = async () => {
    if (!entry) return;

    setLoading(true);
    
    try {
      // Prepara i dati per l'AI
      const contextData = {
        mood: `${entry.mood.level}/5 (${entry.mood.emoji})`,
        symptoms: entry.symptoms.map(s => `${s.name}: ${s.intensity}/7`).join(', '),
        triggers: entry.triggers.map(t => t.name).join(', '),
        activities: entry.activities.map(a => `${a.name}: ${a.value} ${a.unit}`).join(', '),
        weather: entry.weather?.condition || 'non specificato',
        screenTime: `${(entry.screenTime / 60).toFixed(1)} ore`,
        dayRating: `${entry.dayRating}/10`,
        notes: entry.notes || 'nessuna nota',
      };

      const prompt = `
Analizza questa giornata di un utente di un'app per il monitoraggio della salute mentale:

DATI DELLA GIORNATA:
- Umore: ${contextData.mood}
- Sintomi: ${contextData.symptoms || 'nessuno'}
- Fattori scatenanti: ${contextData.triggers || 'nessuno'}
- Attività: ${contextData.activities || 'nessuna'}
- Meteo: ${contextData.weather}
- Tempo schermo: ${contextData.screenTime}
- Valutazione giornata: ${contextData.dayRating}
- Note personali: ${contextData.notes}

Fornisci una risposta in italiano strutturata in 3 sezioni:

1. RESOCONTO: Un breve riassunto comprensivo della giornata (2-3 frasi)
2. CONSIGLI: Suggerimenti personalizzati basati sui dati (2-3 consigli pratici)  
3. COMPITO: Un piccolo compito/obiettivo per domani (1 frase semplice)

Usa un tono empatico, professionale ma amichevole. Concentrati sugli aspetti positivi quando possibile.
`;

      // Send the summary to the local backend which will call the LLM (safer: keeps API key server-side)
      const resp = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: contextData, userFocus: '' })
      });

      if (!resp.ok) {
        throw new Error(`API Error: ${resp.status}`);
      }

      const data = await resp.json();
      const content = data.feedback || '';

      // Parsing della risposta AI
      const sections = content.split(/\d\.\s*(RESOCONTO|CONSIGLI|COMPITO):/);
      
      const summary = sections[2]?.trim() || 'Analisi non disponibile';
      const advice = sections[4]?.trim() || 'Nessun consiglio disponibile';
      const task = sections[6]?.trim() || 'Continua a monitorare il tuo benessere';

      const analysisResult = {
        summary,
        advice,
        task,
      };

      setAnalysis(analysisResult);
      onAnalysisComplete?.(analysisResult);

      toast({
        title: "Analisi completata",
        description: "L'AI ha analizzato la tua giornata",
      });

    } catch (error) {
      console.error('Errore analisi AI:', error);
      toast({
        title: "Errore analisi",
        description: "Impossibile completare l'analisi AI. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Usa l'analisi esistente se disponibile
  useEffect(() => {
    if (entry.aiSummary && entry.aiAdvice && entry.aiTask) {
      setAnalysis({
        summary: entry.aiSummary,
        advice: entry.aiAdvice,
        task: entry.aiTask,
      });
    }
  }, [entry]);

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">Analisi AI della giornata</h3>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={generateAnalysis}
          disabled={loading}
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Brain className="h-4 w-4" />
          )}
          {analysis ? 'Rianalizza' : 'Analizza'}
        </Button>
      </div>

      {loading && (
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-6">
          {/* Resoconto */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="gap-1">
                <Brain className="h-3 w-3" />
                Resoconto
              </Badge>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          {/* Consigli */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="gap-1">
                <Lightbulb className="h-3 w-3" />
                Consigli personalizzati
              </Badge>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {analysis.advice}
            </p>
          </div>

          {/* Compito per domani */}
          <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Obiettivo per domani</span>
            </div>
            <p className="text-sm text-foreground">
              {analysis.task}
            </p>
          </div>

          {/* Augurio finale */}
          <div className="text-center pt-4 border-t">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Moon className="h-4 w-4" />
              <span className="text-sm italic">
                Buon riposo e sogni sereni! 🌙
              </span>
            </div>
          </div>
        </div>
      )}

      {!analysis && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">
            Clicca su "Analizza" per ottenere un resoconto personalizzato della tua giornata
          </p>
        </div>
      )}
    </Card>
  );
};