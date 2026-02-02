/**
 * events.js
 * Handles event creation, enrollment flows, and approval workflows.
 * 
 * Roles:
 * - Admin: Create (Auto-Approved), Approve/Reject Pending Events, Manage All Enrollments.
 * - Club Head: Create (Pending Approval), Manage Own Event Enrollments.
 * - Student: Enroll in Approved Events (Pending Approval).
 */

const Events = {
    currentUser: null,

    init: () => {
        Events.currentUser = Auth.requireAuth();
        if (!Events.currentUser) return;

        Events.renderUI();
        Events.renderEvents();
        Events.setupEventListeners();
    },

    renderUI: () => {
        // Club Head (or legacy Member) and Admin can create events
        if (Events.currentUser.role === 'admin' || Events.currentUser.role === 'club_head' || Events.currentUser.role === 'member') {
            document.getElementById('createControls').style.display = 'block';
        }
    },

    setupEventListeners: () => {
        document.getElementById('eventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            Events.saveEvent();
        });
    },

    getEvents: () => {
        return Storage.get(DB_KEYS.EVENTS) || [];
    },

    renderEvents: () => {
        const grid = document.getElementById('eventsGrid');
        grid.innerHTML = '';
        const events = Events.getEvents().sort((a, b) => new Date(a.date) - new Date(b.date));

        events.forEach(event => {
            // -- Visibility Logic --

            // 1. Students see ONLY Approved events
            if (Events.currentUser.role === 'student' && event.status !== 'approved') return;

            // 2. Club Heads see Approved events AND their own Pending events
            const isOwner = event.organizer === Events.currentUser.username;
            if ((Events.currentUser.role === 'club_head' || Events.currentUser.role === 'member') &&
                event.status !== 'approved' && !isOwner) {
                return;
            }

            // (Admins see everything)

            // -- Card Rendering --
            const dateObj = new Date(event.date);
            const isPast = dateObj < new Date();

            // Enrollment Status for Students
            const participant = event.attendees.find(a => a.userId === Events.currentUser.id);
            const enrollmentStatus = participant ? participant.status : null;

            const card = document.createElement('div');
            card.className = 'glass-card event-card fade-in';

            // Status Badge (Event Level)
            let statusBadge = '';
            if (event.status === 'pending') {
                statusBadge = `<div style="position:absolute; top:10px; right:10px; background:#f59e0b; color:white; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:bold; z-index:10;">PENDING APPROVAL</div>`;
            }

            let actionArea = '';

            // -- Action Buttons Logic --

            if (Events.currentUser.role === 'admin') {
                // ADMIN CONTROLS
                if (event.status === 'pending') {
                    actionArea = `
                        <div style="display: flex; gap: 0.5rem; width: 100%;">
                            <button class="btn btn-primary" style="flex:1; background:var(--success); border-color:var(--success);" onclick="Events.approveEvent('${event.id}')">✓ Approve Event</button>
                            <button class="btn btn-danger btn-icon" onclick="Events.deleteEvent('${event.id}')">🗑️</button>
                        </div>
                    `;
                } else {
                    actionArea = `
                        <div style="display: flex; gap: 0.5rem; justify-content: flex-end; width: 100%;">
                            <button class="btn btn-secondary" onclick="Events.openApprovals('${event.id}')">
                                <span style="font-size: 1.1rem">📋</span> Manage (${event.attendees.length})
                            </button>
                            <button class="btn btn-danger btn-icon" onclick="Events.deleteEvent('${event.id}')">🗑️</button>
                        </div>
                    `;
                }

            } else if (Events.currentUser.role === 'club_head' || Events.currentUser.role === 'member') {
                // CLUB HEAD CONTROLS
                if (isOwner) {
                    actionArea = `
                        <div style="display: flex; gap: 0.5rem; justify-content: flex-end; width: 100%;">
                            <button class="btn btn-secondary" onclick="Events.openApprovals('${event.id}')">
                                <span style="font-size: 1.1rem">📋</span> Manage (${event.attendees.length})
                            </button>
                            ${event.status === 'pending' ? '<span class="text-muted" style="font-size:0.8rem; display:flex; align-items:center;">Waiting for Admin</span>' : ''}
                        </div>
                    `;
                } else {
                    actionArea = `<span class="text-muted">Viewing Event</span>`;
                }

            } else if (Events.currentUser.role === 'student') {
                // STUDENT CONTROLS
                if (isPast) {
                    actionArea = `<span class="text-badge badge-rejected">Ended</span>`;
                } else if (enrollmentStatus === 'approved') {
                    actionArea = `<span class="text-badge badge-approved">✓ Enrolled</span>`;
                } else if (enrollmentStatus === 'pending') {
                    actionArea = `<span class="text-badge badge-pending">⏳ Enrollment Pending</span>`;
                } else if (enrollmentStatus === 'rejected') {
                    actionArea = `<span class="text-badge badge-rejected">✕ Rejected</span>`;
                } else {
                    actionArea = `<button class="btn btn-primary" style="width: 100%" onclick="Events.enroll('${event.id}')">Enroll Now</button>`;
                }
            }

            const month = dateObj.toLocaleString('default', { month: 'short' });
            const day = dateObj.getDate();
            const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            card.innerHTML = `
                ${statusBadge}
                <div class="event-card-header">
                    <div>
                        <h3 class="event-title">${event.title}</h3>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">${time}</div>
                        <div style="font-size: 0.75rem; color: var(--primary); margin-top:0.25rem;">By: ${event.organizer}</div>
                    </div>
                    <div class="event-date-badge">
                        <div class="month">${month}</div>
                        <div class="day">${day}</div>
                    </div>
                </div>
                <div class="event-body">
                    <div class="event-meta">
                        <span>📍 ${event.venue}</span>
                        <span>👥 ${event.attendees.filter(a => a.status === 'approved').length} Going</span>
                    </div>
                    <p style="color: var(--text-muted); line-height: 1.5; font-size: 0.95rem;">${event.description}</p>
                </div>
                <div class="event-footer">
                   ${actionArea}
                </div>
            `;
            grid.appendChild(card);
        });

        if (grid.children.length === 0) {
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No events available for you.</p>`;
        }
    },

    // Create Event
    openModal: () => {
        document.getElementById('eventModal').classList.add('open');
        document.getElementById('eventForm').reset();
    },

    closeModal: () => {
        document.getElementById('eventModal').classList.remove('open');
    },

    saveEvent: () => {
        const title = document.getElementById('eventTitle').value;
        const date = document.getElementById('eventDate').value;
        const venue = document.getElementById('eventVenue').value;
        const description = document.getElementById('eventDesc').value;

        let events = Events.getEvents();

        // Logic: Admin created -> Approved immediately. Club Head -> Pending.
        const isAdmin = Events.currentUser.role === 'admin';

        const newEvent = {
            id: Date.now().toString(),
            title, date, venue, description,
            organizer: Events.currentUser.username,
            status: isAdmin ? 'approved' : 'pending',
            attendees: []
        };
        events.push(newEvent);

        Storage.set(DB_KEYS.EVENTS, events);
        Events.closeModal();
        Events.renderEvents();

        if (!isAdmin) {
            alert('Event created! It is now PENDING ADMIN APPROVAL before students can see it.');
        }
    },

    approveEvent: (id) => {
        let events = Events.getEvents();
        const event = events.find(e => e.id === id);
        if (event) {
            event.status = 'approved';
            Storage.set(DB_KEYS.EVENTS, events);
            Events.renderEvents();
        }
    },

    deleteEvent: (id) => {
        if (confirm('Delete this event?')) {
            let events = Events.getEvents().filter(e => e.id !== id);
            Storage.set(DB_KEYS.EVENTS, events);
            Events.renderEvents();
        }
    },

    // Student Enrollment
    enroll: (eventId) => {
        let events = Events.getEvents();
        const eventIndex = events.findIndex(e => e.id === eventId);

        events[eventIndex].attendees.push({
            userId: Events.currentUser.id,
            name: Events.currentUser.name,
            status: 'pending', // Enrollments trigger pending state for moderation
            registeredAt: new Date().toISOString(),
            attended: false
        });

        Storage.set(DB_KEYS.EVENTS, events);
        Events.renderEvents();
    },

    // Manage Enrollments (Admin & Club Head)
    openApprovals: (eventId) => {
        const event = Events.getEvents().find(e => e.id === eventId);
        document.getElementById('approvalEventTitle').textContent = `Manage: ${event.title}`;
        document.getElementById('approvalsModal').dataset.eventId = eventId;

        Events.renderApprovalLists(event);
        document.getElementById('approvalsModal').classList.add('open');
    },

    closeApprovals: () => {
        document.getElementById('approvalsModal').classList.remove('open');
        Events.renderEvents();
    },

    renderApprovalLists: (event) => {
        const pendingList = document.getElementById('pendingList');
        const approvedList = document.getElementById('approvedList');

        pendingList.innerHTML = '';
        approvedList.innerHTML = '';

        const pending = event.attendees.filter(a => a.status === 'pending');
        const approved = event.attendees.filter(a => a.status === 'approved');

        // Render Pending
        if (pending.length === 0) pendingList.innerHTML = '<div style="padding: 1rem; color: var(--text-muted); text-align: center;">No pending requests</div>';

        pending.forEach(p => {
            const item = document.createElement('div');
            item.className = 'participant-item';
            item.innerHTML = `
                <span>${p.name} <small style="color:var(--text-muted);">ID: ${p.userId}</small></span>
                <div style="display: flex; gap: 0.5rem">
                    <button class="btn-icon" style="border-color: var(--success); color: var(--success); height: 30px; width: 30px;" onclick="Events.updateStatus('${event.id}', '${p.userId}', 'approved')">✓</button>
                    <button class="btn-icon" style="border-color: var(--danger); color: var(--danger); height: 30px; width: 30px;" onclick="Events.updateStatus('${event.id}', '${p.userId}', 'rejected')">✕</button>
                </div>
            `;
            pendingList.appendChild(item);
        });

        // Render Approved (Attendance)
        if (approved.length === 0) approvedList.innerHTML = '<div style="padding: 1rem; color: var(--text-muted); text-align: center;">No approved participants</div>';

        approved.forEach(p => {
            const item = document.createElement('div');
            item.className = 'participant-item';
            item.innerHTML = `
                <span>${p.name}</span>
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                    <span style="font-size: 0.85rem">Attended</span>
                    <input type="checkbox" ${p.attended ? 'checked' : ''} onchange="Events.toggleAttendance('${event.id}', '${p.userId}')" style="width: 18px; height: 18px;">
                </label>
            `;
            approvedList.appendChild(item);
        });
    },

    updateStatus: (eventId, userId, newStatus) => {
        let events = Events.getEvents();
        const eventIndex = events.findIndex(e => e.id === eventId);
        const attendee = events[eventIndex].attendees.find(a => a.userId === userId);

        attendee.status = newStatus;

        Storage.set(DB_KEYS.EVENTS, events);
        Events.renderApprovalLists(events[eventIndex]);
    },

    toggleAttendance: (eventId, userId) => {
        let events = Events.getEvents();
        const event = events.find(e => e.id === eventId);
        const attendee = event.attendees.find(a => a.userId === userId);
        attendee.attended = !attendee.attended;
        Storage.set(DB_KEYS.EVENTS, events);
    }
};

document.addEventListener('DOMContentLoaded', Events.init);
