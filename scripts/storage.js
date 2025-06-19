class EventStorage {
    constructor() {
        this.storageKey = 'calendarEvents';
    }
    
    async getEvents() {
        const eventsJson = localStorage.getItem(this.storageKey);
        return eventsJson ? JSON.parse(eventsJson) : [];
    }
    
    async saveEvent(event) {
        const events = await this.getEvents();
        const existingIndex = events.findIndex(e => e.id === event.id);
        
        if (existingIndex >= 0) {
            events[existingIndex] = event;
        } else {
            events.push(event);
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(events));
    }
    
    async deleteEvent(eventId) {
        const events = await this.getEvents();
        const filteredEvents = events.filter(e => e.id !== eventId);
        localStorage.setItem(this.storageKey, JSON.stringify(filteredEvents));
    }
    
    async getEventsForDate(date) {
        const events = await this.getEvents();
        const dateStr = date.toISOString().split('T')[0];
        
        return events.filter(event => {
            const eventDateStr = event.date.split('T')[0];
            return eventDateStr === dateStr;
        });
    }
    
    async getEventsForDateRange(startDate, endDate) {
        const events = await this.getEvents();
        
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= startDate && eventDate <= endDate;
        });
    }
    
    async getUpcomingEvents(days = 30) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        
        return this.getEventsForDateRange(today, futureDate);
    }
}
