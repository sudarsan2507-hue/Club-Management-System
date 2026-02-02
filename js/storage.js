/**
 * storage.js
 * Handles all interactions with LocalStorage.
 * Values are stored as JSON strings.
 */

const DB_KEYS = {
    USERS: 'cms_users',
    MEMBERS: 'cms_members',
    EVENTS: 'cms_events',
    ANNOUNCEMENTS: 'cms_announcements',
    FUNDS: 'cms_funds',
    SESSION: 'cms_session'
};

const Storage = {
    get: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    set: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    },

    init: () => {
        // Seed initial data if not present
        const users = Storage.get(DB_KEYS.USERS);
        if (!users) {
            const initialUsers = [
                { id: '1', username: 'admin', password: 'password', role: 'admin', name: 'System Admin' },
                { id: '2', username: 'member', password: 'password', role: 'member', name: 'Jane Doe' },
                { id: '3', username: 'student', password: 'password', role: 'student', name: 'Mike Ross' }
            ];
            Storage.set(DB_KEYS.USERS, initialUsers);
            console.log('Seeded Users');
        } else {
            // Migration: Ensure student user exists for existing databases
            if (!users.find(u => u.username === 'student')) {
                users.push({ id: '3', username: 'student', password: 'password', role: 'student', name: 'Mike Ross' });
                Storage.set(DB_KEYS.USERS, users);
                console.log('Migrated: Added Student User');
            }
            // Migration: Ensure clubhead user exists
            if (!users.find(u => u.username === 'clubhead')) {
                users.push({ id: '4', username: 'clubhead', password: 'password', role: 'club_head', name: 'Harvey Specter' });
                Storage.set(DB_KEYS.USERS, users);
                console.log('Migrated: Added Club Head User');
            }
        }

        if (!Storage.get(DB_KEYS.MEMBERS)) {
            const initialMembers = [
                { id: '1', name: 'John Doe', email: 'john@example.com', joinDate: '2023-01-15', status: 'Active' },
                { id: '2', name: 'Jane Smith', email: 'jane@example.com', joinDate: '2023-02-20', status: 'Inactive' }
            ];
            Storage.set(DB_KEYS.MEMBERS, initialMembers);
            console.log('Seeded Members');
        }

        if (!Storage.get(DB_KEYS.EVENTS)) {
            const initialEvents = [
                { id: '1', title: 'Annual Tech Meetup', date: '2023-11-20', venue: 'Main Auditorium', description: 'A gathering of tech enthusiasts.', attendees: [] }
            ];
            Storage.set(DB_KEYS.EVENTS, initialEvents);
            console.log('Seeded Events');
        }

        if (!Storage.get(DB_KEYS.ANNOUNCEMENTS)) {
            const initialAnnouncements = [
                { id: '1', title: 'Welcome to the new CMS!', content: 'We are excited to launch our new system.', date: '2023-10-01' }
            ];
            Storage.set(DB_KEYS.ANNOUNCEMENTS, initialAnnouncements);
            console.log('Seeded Announcements');
        }

        if (!Storage.get(DB_KEYS.FUNDS)) {
            const initialFunds = [
                { id: '1', type: 'income', amount: 5000, description: 'Sponsorship Grant', date: '2023-01-01' },
                { id: '2', type: 'expense', amount: 200, description: 'Server Hosting', date: '2023-01-05' }
            ];
            Storage.set(DB_KEYS.FUNDS, initialFunds);
            console.log('Seeded Funds');
        }
    }
};

// Initialize DB on load
Storage.init();
