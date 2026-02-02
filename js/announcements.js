/**
 * announcements.js
 * Handles announcement posting and feed rendering.
 */

const Announcements = {
    currentUser: null,

    init: () => {
        Announcements.currentUser = Auth.requireAuth();
        if (!Announcements.currentUser) return;

        Announcements.renderUI();
        Announcements.renderFeed();
        Announcements.setupEventListeners();
    },

    renderUI: () => {
        if (Announcements.currentUser.role === 'admin') {
            document.getElementById('postFormContainer').style.display = 'block';
        }
    },

    setupEventListeners: () => {
        const form = document.getElementById('announcementForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                Announcements.postAnnouncement();
            });
        }
    },

    getAnnouncements: () => {
        return Storage.get(DB_KEYS.ANNOUNCEMENTS) || [];
    },

    renderFeed: () => {
        const feed = document.getElementById('announcementsFeed');
        feed.innerHTML = '';

        // Sort newest first
        const items = Announcements.getAnnouncements().sort((a, b) => new Date(b.date) - new Date(a.date));

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'glass-card announcement-card fade-in';

            let deleteBtn = '';
            if (Announcements.currentUser.role === 'admin') {
                deleteBtn = `
                    <div class="admin-actions">
                        <button class="btn btn-danger" style="padding: 0.4rem;" onclick="Announcements.deleteAnnouncement('${item.id}')">🗑️</button>
                    </div>
                `;
            }

            card.innerHTML = `
                ${deleteBtn}
                <small class="announcement-date">${new Date(item.date).toLocaleDateString()} • ${new Date(item.date).toLocaleTimeString()}</small>
                <h3 style="margin-bottom: 1rem; color: var(--primary)">${item.title}</h3>
                <p style="white-space: pre-wrap;">${item.content}</p>
            `;
            feed.appendChild(card);
        });

        if (items.length === 0) {
            feed.innerHTML = `<p style="text-align: center; color: var(--text-muted); margin-top: 2rem;">No announcements yet.</p>`;
        }
    },

    postAnnouncement: () => {
        const title = document.getElementById('annTitle').value;
        const content = document.getElementById('annContent').value;

        const newItem = {
            id: Date.now().toString(),
            title,
            content,
            date: new Date().toISOString()
        };

        const items = Announcements.getAnnouncements();
        items.push(newItem);
        Storage.set(DB_KEYS.ANNOUNCEMENTS, items);

        document.getElementById('announcementForm').reset();
        Announcements.renderFeed();
    },

    deleteAnnouncement: (id) => {
        if (confirm('Delete this announcement?')) {
            let items = Announcements.getAnnouncements().filter(i => i.id !== id);
            Storage.set(DB_KEYS.ANNOUNCEMENTS, items);
            Announcements.renderFeed();
        }
    }
};

document.addEventListener('DOMContentLoaded', Announcements.init);
