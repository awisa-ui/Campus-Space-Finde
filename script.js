document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    // In a real application, this would be fetched from an API
    const classroomData = [
        {
            name: "Room 101",
            capacity: 50,
            schedule: [
                { title: "CS 101: Intro to Programming", start: "09:00", end: "10:30" },
                { title: "MATH 203: Linear Algebra", start: "11:00", end: "12:30" },
                { title: "PHYS 105: Classical Mechanics", start: "14:00", end: "15:30" }
            ]
        },
        {
            name: "Room 102",
            capacity: 30,
            schedule: [
                { title: "ENG 210: Shakespeare", start: "10:00", end: "11:30" },
                { title: "HIST 301: The Roman Empire", start: "13:00", end: "14:30" }
            ]
        },
        {
            name: "Auditorium A",
            capacity: 200,
            schedule: [
                { title: "CHEM 101: General Chemistry", start: "08:30", end: "10:00" },
                { title: "BIO 101: Introduction to Biology", start: "10:00", end: "11:30" },
                { title: "ECON 101: Microeconomics", start: "13:30", end: "15:00" },
                { title: "GUEST LECTURE: AI Ethics", start: "18:00", end: "19:30" }
            ]
        },
        {
            name: "Lab 205",
            capacity: 25,
            schedule: [
                { title: "CS 250: Data Structures Lab", start: "09:00", end: "12:00" },
                { title: "EE 310: Circuits Lab", start: "13:00", end: "16:00" }
            ]
        },
        {
            name: "Study Hall B",
            capacity: 75,
            schedule: [] // This room is always available
        }
    ];

    // --- DOM ELEMENTS ---
    const classroomList = document.getElementById('classroom-list');
    const searchInput = document.getElementById('search-input');
    const availableNowCheckbox = document.getElementById('available-now-checkbox');

    // --- HELPER FUNCTIONS ---

    /**
     * Gets the current time as a string in "HH:MM" format.
     * @returns {string} The current time.
     */
    const getCurrentTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    /**
     * Checks if a classroom is currently in use.
     * @param {Array} schedule - The classroom's schedule array.
     * @param {string} currentTime - The current time in "HH:MM".
     * @returns {Object|null} The current booking if in use, otherwise null.
     */
    const getCurrentBooking = (schedule, currentTime) => {
        return schedule.find(booking => currentTime >= booking.start && currentTime < booking.end);
    };

    /**
     * Finds the next time a classroom will be available.
     * @param {Array} schedule - The classroom's schedule array.
     * @param {string} currentTime - The current time in "HH:MM".
     * @returns {string} A message indicating when the room is next free.
     */
    const findNextAvailableTime = (schedule, currentTime) => {
        const currentBooking = getCurrentBooking(schedule, currentTime);

        if (!currentBooking) {
            return "Available now";
        }

        // Sort schedule by start time to find the next gap
        const sortedSchedule = [...schedule].sort((a, b) => a.start.localeCompare(b.start));
        
        // The room is currently busy, so it will be free at the end of the current booking.
        return `Free at ${currentBooking.end}`;
    };


    // --- MAIN RENDER FUNCTION ---
    const renderClassrooms = () => {
        classroomList.innerHTML = ''; // Clear the list before rendering

        const currentTime = getCurrentTime();
        const searchTerm = searchInput.value.toLowerCase();
        const showOnlyAvailable = availableNowCheckbox.checked;

        const filteredData = classroomData.filter(classroom => {
            const isAvailable = !getCurrentBooking(classroom.schedule, currentTime);
            const matchesSearch = classroom.name.toLowerCase().includes(searchTerm);
            
            if (showOnlyAvailable) {
                return isAvailable && matchesSearch;
            }
            return matchesSearch;
        });

        if (filteredData.length === 0) {
            classroomList.innerHTML = `<p style="text-align: center; grid-column: 1 / -1;">No classrooms match your criteria.</p>`;
            return;
        }

        filteredData.forEach(classroom => {
            const currentBooking = getCurrentBooking(classroom.schedule, currentTime);
            const isAvailable = !currentBooking;
            const nextAvailableMsg = findNextAvailableTime(classroom.schedule, currentTime);

            const scheduleHtml = classroom.schedule.length > 0
                ? classroom.schedule.map(b => `<li><strong>${b.start} - ${b.end}:</strong> ${b.title}</li>`).join('')
                : '<li>No classes scheduled for today.</li>';

            const card = document.createElement('div');
            card.className = 'classroom-card';
            card.innerHTML = `
                <div class="card-header">
                    <h2>${classroom.name}</h2>
                    <span class="status ${isAvailable ? 'available' : 'in-use'}">
                        ${isAvailable ? 'Available' : 'In Use'}
                    </span>
                </div>
                <p><strong>Today's Schedule:</strong></p>
                <ul class="schedule-list">${scheduleHtml}</ul>
                <p class="availability-info">${nextAvailableMsg}</p>
            `;
            classroomList.appendChild(card);
        });
    };

    // --- EVENT LISTENERS ---
    searchInput.addEventListener('input', renderClassrooms);
    availableNowCheckbox.addEventListener('change', renderClassrooms);
    
    // Initial render on page load
    renderClassrooms();

    // Re-render every minute to keep the status updated
    setInterval(renderClassrooms, 60000); 
});