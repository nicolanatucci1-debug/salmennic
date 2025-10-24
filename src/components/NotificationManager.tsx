import React, { useEffect, useState } from 'react';
import { useMentalHealthStore } from '@/store';
import { useToast } from '@/hooks/use-toast';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const NotificationManager: React.FC = () => {
  const { toast } = useToast();
  const { currentProfile, updateProfile } = useMentalHealthStore();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Verifica se le notifiche sono supportate
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Notifiche non supportate",
        description: "Il tuo browser non supporta le notifiche push",
        variant: "destructive",
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (currentProfile) {
        updateProfile({
          preferences: {
            ...currentProfile.preferences,
            notificationPermission: permission,
            enableNotifications: permission === 'granted',
          }
        });
      }

      if (permission === 'granted') {
        toast({
          title: "Notifiche attivate",
          description: "Riceverai promemoria giornalieri all'orario impostato",
        });
        
        // Programma le notifiche
        scheduleNotifications();
      } else {
        toast({
          title: "Notifiche rifiutate",
          description: "Puoi attivarle manualmente dalle impostazioni del browser",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Errore richiesta notifiche:', error);
      toast({
        title: "Errore",
        description: "Impossibile richiedere i permessi per le notifiche",
        variant: "destructive",
      });
    }
  };

  const scheduleNotifications = () => {
    if (!currentProfile || permission !== 'granted') return;

    // Cancella notifiche precedenti
    navigator.serviceWorker.ready.then(registration => {
      registration.getNotifications().then(notifications => {
        notifications.forEach(notification => notification.close());
      });
    });

    // Programma la notifica giornaliera
    const scheduleDaily = () => {
      const [hours, minutes] = currentProfile.preferences.reminderTime.split(':').map(Number);
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // Se l'orario è già passato oggi, programma per domani
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const timeUntilNotification = scheduledTime.getTime() - now.getTime();

      setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification('È il momento di fare il punto di oggi', {
            body: 'Registra il tuo umore e come ti senti oggi',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'daily-reminder',
            requireInteraction: true,
          });
        }
        
        // Programma per il giorno successivo
        scheduleDaily();
      }, timeUntilNotification);
    };

    scheduleDaily();
  };

  // Programma automaticamente se già autorizzato
  useEffect(() => {
    if (permission === 'granted' && currentProfile?.preferences.enableNotifications) {
      scheduleNotifications();
    }
  }, [permission, currentProfile?.preferences.enableNotifications, currentProfile?.preferences.reminderTime]);

  const toggleNotifications = () => {
    if (!currentProfile) return;

    if (permission === 'granted') {
      const newState = !currentProfile.preferences.enableNotifications;
      updateProfile({
        preferences: {
          ...currentProfile.preferences,
          enableNotifications: newState,
        }
      });

      if (newState) {
        scheduleNotifications();
        toast({
          title: "Notifiche attivate",
          description: "Riceverai promemoria giornalieri",
        });
      } else {
        // Cancella notifiche programmate
        navigator.serviceWorker.ready.then(registration => {
          registration.getNotifications().then(notifications => {
            notifications.forEach(notification => notification.close());
          });
        });
        toast({
          title: "Notifiche disattivate",
          description: "Non riceverai più promemoria",
        });
      }
    } else {
      requestNotificationPermission();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {permission === 'granted' && currentProfile?.preferences.enableNotifications ? (
            <Bell className="h-5 w-5 text-green-500" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <h3 className="font-semibold">Promemoria giornaliero</h3>
            <p className="text-sm text-muted-foreground">
              {permission === 'granted' 
                ? currentProfile?.preferences.enableNotifications 
                  ? `Attivo alle ${currentProfile?.preferences.reminderTime}`
                  : 'Disattivato'
                : 'Non autorizzato'
              }
            </p>
          </div>
        </div>
        
        <Button
          variant={permission === 'granted' && currentProfile?.preferences.enableNotifications ? "default" : "outline"}
          onClick={toggleNotifications}
          size="sm"
        >
          {permission === 'granted' 
            ? currentProfile?.preferences.enableNotifications ? 'Disattiva' : 'Attiva'
            : 'Autorizza'
          }
        </Button>
      </div>
    </Card>
  );
};