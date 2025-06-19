class AlarmManager {
    constructor() {
        this.audioContext = null;
        this.alarmSound = null;
        this.alarmStorageKey = 'calendarAlarms';
    }
    
    async setAlarm(event) {
        if (!event.hasAlarm || !event.date) return;
        
        const eventTime = new Date(event.date);
        const now = new Date();
        
        // Don't set alarms for past events
        if (eventTime <= now) return;
        
        const alarms = await this.getAlarms();
        alarms.push({
            eventId: event.id,
            triggerTime: eventTime.toISOString(),
            title: event.title,
            notes: event.notes
        });
        
        localStorage.setItem(this.alarmStorageKey, JSON.stringify(alarms));
        
        // Schedule notification
        this.scheduleNotification(event);
    }
    
    async getAlarms() {
        const alarmsJson = localStorage.getItem(this.alarmStorageKey);
        return alarmsJson ? JSON.parse(alarmsJson) : [];
    }
    
    async removeAlarm(eventId) {
        const alarms = await this.getAlarms();
        const filteredAlarms = alarms.filter(a => a.eventId !== eventId);
        localStorage.setItem(this.alarmStorageKey, JSON.stringify(filteredAlarms));
    }
    
    async checkAlarms() {
        const now = new Date();
        const alarms = await this.getAlarms();
        const triggeredAlarms = [];
        
        // Check for alarms that should have triggered
        for (const alarm of alarms) {
            const triggerTime = new Date(alarm.triggerTime);
            
            if (triggerTime <= now) {
                triggeredAlarms.push(alarm);
                this.triggerAlarm(alarm);
                await this.removeAlarm(alarm.eventId);
            }
        }
        
        return triggeredAlarms;
    }
    
    triggerAlarm(alarm) {
        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(alarm.title, {
                body: alarm.notes || 'Event reminder',
                icon: '/assets/icons/icon-192x192.png'
            });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(alarm.title, {
                        body: alarm.notes || 'Event reminder',
                        icon: '/assets/icons/icon-192x192.png'
                    });
                }
            });
        }
        
        // Play sound
        this.playAlarmSound();
    }
    
    playAlarmSound() {
        // Try to use Web Audio API if available
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            if (!this.alarmSound) {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.value = 800;
                gainNode.gain.value = 0.5;
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.5);
                
                // Beep twice
                setTimeout(() => {
                    const oscillator2 = this.audioContext.createOscillator();
                    const gainNode2 = this.audioContext.createGain();
                    
                    oscillator2.type = 'sine';
                    oscillator2.frequency.value = 800;
                    gainNode2.gain.value = 0.5;
                    
                    oscillator2.connect(gainNode2);
                    gainNode2.connect(this.audioContext.destination);
                    
                    oscillator2.start();
                    oscillator2.stop(this.audioContext.currentTime + 0.5);
                }, 600);
            }
        } catch (e) {
            console.error('Web Audio API not supported', e);
        }
    }
    
    scheduleNotification(event) {
        if (!('Notification' in window)) return;
        
        const eventTime = new Date(event.date);
        const now = new Date();
        const timeUntilEvent = eventTime - now;
        
        if (timeUntilEvent <= 0) return;
        
        setTimeout(() => {
            if (Notification.permission === 'granted') {
                new Notification(event.title, {
                    body: event.notes || 'Event reminder',
                    icon: '/assets/icons/icon-192x192.png'
                });
                this.playAlarmSound();
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(event.title, {
                            body: event.notes || 'Event reminder',
                            icon: '/assets/icons/icon-192x192.png'
                        });
                        this.playAlarmSound();
                    }
                });
            }
        }, timeUntilEvent);
    }
}
