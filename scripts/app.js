document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    const calendar = new Calendar();
    const storage = new EventStorage();
    const alarmManager = new AlarmManager();
    
    // Current date
    let currentDate = new Date();
    
    // DOM Elements
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthYear = document.getElementById('current-month-year');
    const navToggle = document.getElementById('nav-toggle');
    const navDrawer = document.getElementById('nav-drawer');
    const closeDrawer = document.querySelector('.close-drawer');
    const todayBtn = document.getElementById('today-btn');
    const addEventBtn = document.getElementById('add-event-btn');
    const eventModal = document.getElementById('event-modal');
    const closeModal = document.querySelectorAll('.close-modal');
    const cancelEvent = document.getElementById('cancel-event');
    const saveEvent = document.getElementById('save-event');
    const yearModal = document.getElementById('year-modal');
    const viewYear = document.getElementById('view-year');
    const currentYear = document.getElementById('current-year');
    const prevYear = document.querySelector('.prev-year');
    const nextYear = document.querySelector('.next-year');
    const yearGrid = document.getElementById('year-grid');
    const viewUpcoming = document.getElementById('view-upcoming');
    const eventsList = document.getElementById('events-list');
    
    // Initialize calendar
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        currentMonthYear.textContent = `${calendar.getMonthName(month)} ${year}`;
        
        const daysInMonth = calendar.getDaysInMonth(year, month);
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        
        calendarGrid.innerHTML = '';
        
        // Previous month days
        const prevMonthDays = calendar.getDaysInMonth(year, month - 1);
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const day = prevMonthDays - i;
            const date = new Date(year, month - 1, day);
            createDayElement(date, true);
        }
        
        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            createDayElement(date, false);
        }
        
        // Next month days
        const daysToAdd = 42 - (firstDayOfMonth + daysInMonth);
        for (let day = 1; day <= daysToAdd; day++) {
            const date = new Date(year, month + 1, day);
            createDayElement(date, true);
        }
        
        // Load events for the current month
        loadEventsForMonth(year, month);
    }
    
    function createDayElement(date, isOtherMonth) {
        const day = date.getDate();
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.dataset.date = date.toISOString().split('T')[0];
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        if (calendar.isSameDay(date, new Date())) {
            dayElement.classList.add('today');
        }
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = day;
        
        const dayEvents = document.createElement('div');
        dayEvents.className = 'calendar-day-events';
        
        dayElement.appendChild(dayNumber);
        dayElement.appendChild(dayEvents);
        calendarGrid.appendChild(dayElement);
        
        // Add click event
        dayElement.addEventListener('click', function() {
            selectDay(date);
        });
    }
    
    function selectDay(date) {
        // Remove previous selection
        const selected = document.querySelector('.calendar-day.selected');
        if (selected) selected.classList.remove('selected');
        
        // Add selection to clicked day
        const dayElements = document.querySelectorAll('.calendar-day');
        dayElements.forEach(dayEl => {
            const dayDate = new Date(dayEl.dataset.date);
            if (calendar.isSameDay(dayDate, date)) {
                dayEl.classList.add('selected');
            }
        });
        
        // Open event modal with this date pre-selected
        openEventModal(date);
    }
    
    function loadEventsForMonth(year, month) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        
        storage.getEventsForDateRange(startDate, endDate).then(events => {
            events.forEach(event => {
                const eventDate = new Date(event.date);
                const dayElement = document.querySelector(`.calendar-day[data-date="${eventDate.toISOString().split('T')[0}"]`);
                
                if (dayElement) {
                    const dayEvents = dayElement.querySelector('.calendar-day-events');
                    const eventElement = document.createElement('div');
                    eventElement.className = 'day-event';
                    eventElement.textContent = event.title;
                    dayEvents.appendChild(eventElement);
                }
            });
        });
    }
    
    function loadUpcomingEvents() {
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        
        storage.getEventsForDateRange(today, nextMonth).then(events => {
            eventsList.innerHTML = '';
            
            if (events.length === 0) {
                eventsList.innerHTML = '<p>No upcoming events</p>';
                return;
            }
            
            events.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            events.forEach(event => {
                const eventDate = new Date(event.date);
                const eventElement = document.createElement('div');
                eventElement.className = 'event-item';
                
                const title = document.createElement('div');
                title.className = 'event-title';
                title.textContent = event.title;
                
                const date = document.createElement('div');
                date.className = 'event-date';
                date.textContent = calendar.formatDate(eventDate);
                
                const notes = document.createElement('div');
                notes.className = 'event-notes';
                notes.textContent = event.notes || 'No additional notes';
                
                eventElement.appendChild(title);
                eventElement.appendChild(date);
                eventElement.appendChild(notes);
                eventsList.appendChild(eventElement);
            });
        });
    }
    
    function openEventModal(date = null) {
        const modal = eventModal;
        const titleInput = document.getElementById('event-title');
        const dateInput = document.getElementById('event-date');
        const timeInput = document.getElementById('event-time');
        const notesInput = document.getElementById('event-notes');
        const alarmInput = document.getElementById('event-alarm');
        
        // Reset form
        titleInput.value = '';
        dateInput.value = date ? date.toISOString().split('T')[0] : '';
        timeInput.value = '';
        notesInput.value = '';
        alarmInput.checked = false;
        
        modal.classList.add('open');
    }
    
    function closeEventModal() {
        eventModal.classList.remove('open');
    }
    
    function openYearModal() {
        const year = currentDate.getFullYear();
        currentYear.textContent = year;
        renderYearView(year);
        yearModal.classList.add('open');
    }
    
    function closeYearModal() {
        yearModal.classList.remove('open');
    }
    
    function renderYearView(year) {
        yearGrid.innerHTML = '';
        
        for (let month = 0; month < 12; month++) {
            const monthElement = document.createElement('div');
            monthElement.className = 'year-month';
            monthElement.dataset.month = month;
            
            const monthName = document.createElement('h4');
            monthName.textContent = calendar.getMonthName(month);
            
            const miniCalendar = document.createElement('div');
            miniCalendar.className = 'mini-calendar';
            
            // Create weekday headers (optional)
            
            // Get first day of month and days in month
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = calendar.getDaysInMonth(year, month);
            
            // Previous month days
            const prevMonthDays = calendar.getDaysInMonth(year, month - 1);
            for (let i = firstDay - 1; i >= 0; i--) {
                const dayElement = document.createElement('div');
                dayElement.className = 'mini-day other-month';
                dayElement.textContent = prevMonthDays - i;
                miniCalendar.appendChild(dayElement);
            }
            
            // Current month days
            const today = new Date();
            for (let day = 1; day <= daysInMonth; day++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'mini-day';
                dayElement.textContent = day;
                
                if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                    dayElement.classList.add('today');
                }
                
                miniCalendar.appendChild(dayElement);
            }
            
            // Next month days
            const totalCells = 42; // 6 rows x 7 days
            const remainingCells = totalCells - (firstDay + daysInMonth);
            for (let day = 1; day <= remainingCells; day++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'mini-day other-month';
                dayElement.textContent = day;
                miniCalendar.appendChild(dayElement);
            }
            
            monthElement.appendChild(monthName);
            monthElement.appendChild(miniCalendar);
            yearGrid.appendChild(monthElement);
            
            // Add click event
            monthElement.addEventListener('click', function() {
                const selectedMonth = parseInt(this.dataset.month);
                currentDate = new Date(year, selectedMonth, 1);
                renderCalendar();
                closeYearModal();
            });
        }
    }
    
    // Event Listeners
    navToggle.addEventListener('click', function() {
        navDrawer.classList.add('open');
    });
    
    closeDrawer.addEventListener('click', function() {
        navDrawer.classList.remove('open');
    });
    
    todayBtn.addEventListener('click', function() {
        currentDate = new Date();
        renderCalendar();
    });
    
    addEventBtn.addEventListener('click', function() {
        openEventModal();
    });
    
    closeModal.forEach(btn => {
        btn.addEventListener('click', function() {
            if (eventModal.classList.contains('open')) {
                closeEventModal();
            }
            if (yearModal.classList.contains('open')) {
                closeYearModal();
            }
        });
    });
    
    cancelEvent.addEventListener('click', function() {
        closeEventModal();
    });
    
    saveEvent.addEventListener('click', function() {
        const title = document.getElementById('event-title').value.trim();
        const date = document.getElementById('event-date').value;
        const time = document.getElementById('event-time').value;
        const notes = document.getElementById('event-notes').value.trim();
        const hasAlarm = document.getElementById('event-alarm').checked;
        
        if (!title || !date) {
            alert('Please fill in all required fields');
            return;
        }
        
        let eventDate = new Date(date);
        if (time) {
            const [hours, minutes] = time.split(':');
            eventDate.setHours(parseInt(hours));
            eventDate.setMinutes(parseInt(minutes));
        }
        
        const event = {
            id: Date.now().toString(),
            title,
            date: eventDate.toISOString(),
            notes,
            hasAlarm
        };
        
        storage.saveEvent(event).then(() => {
            if (hasAlarm) {
                alarmManager.setAlarm(event);
            }
            renderCalendar();
            loadUpcomingEvents();
            closeEventModal();
        });
    });
    
    viewYear.addEventListener('click', function() {
        openYearModal();
        navDrawer.classList.remove('open');
    });
    
    prevYear.addEventListener('click', function() {
        const year = parseInt(currentYear.textContent) - 1;
        currentYear.textContent = year;
        renderYearView(year);
    });
    
    nextYear.addEventListener('click', function() {
        const year = parseInt(currentYear.textContent) + 1;
        currentYear.textContent = year;
        renderYearView(year);
    });
    
    viewUpcoming.addEventListener('click', function() {
        loadUpcomingEvents();
        navDrawer.classList.remove('open');
    });
    
    // Initialize
    renderCalendar();
    loadUpcomingEvents();
    
    // Check for alarms
    alarmManager.checkAlarms();
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js').then(registration => {
                console.log('ServiceWorker registration successful');
            }).catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
});
