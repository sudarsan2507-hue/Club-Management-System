/**
 * app.js
 * Handles shared layout logic, sidebar rendering, and global UI state.
 */

const App = {
    init: () => {
        const user = Auth.requireAuth();
        if (!user) return; // Auth redirect handles this

        App.renderLayout(user);
        App.highlightCurrentPage();
    },

    renderLayout: (user) => {
        // Inject Sidebar and Header
        const body = document.body;

        // We'll wrap the existing content in a main-content div if not already
        const existingContent = document.querySelector('.main-content') || document.body;

        // Create Sidebar
        const sidebar = document.createElement('aside');
        sidebar.className = 'sidebar glass-card';
        sidebar.innerHTML = `
            <div class="brand">
                <h2>ClubManager</h2>
            </div>
            <div class="user-profile">
                <div class="avatar">${user.name.charAt(0)}</div>
                <div class="info">
                    <p class="name">${user.name}</p>
                    <p class="role">${user.role === 'club_head' ? 'Club Head' : user.role}</p>
                </div>
            </div>
            <nav class="nav-links">
                <a href="dashboard.html" class="nav-item" data-page="dashboard"><i class="icon">📊</i> Dashboard</a>
                ${user.role === 'admin' ? `<a href="members.html" class="nav-item" data-page="members"><i class="icon">👥</i> Members</a>` : ''}
                <a href="events.html" class="nav-item" data-page="events"><i class="icon">📅</i> Events</a>
                <a href="announcements.html" class="nav-item" data-page="announcements"><i class="icon">📢</i> Announcements</a>
                ${user.role === 'admin' ? `<a href="funds.html" class="nav-item" data-page="funds"><i class="icon">💰</i> Funds</a>` : ''}
            </nav>
            <div class="logout-container">
                <button onclick="Auth.logout()" class="btn btn-secondary logout-btn">Logout</button>
            </div>
        `;

        // If body doesn't have the layout structure, we need to restructure it
        // The pages will just contain the specific content div usually?
        // Let's assume the pages create a <main class="main-content"> and we prepend the sidebar to body

        if (!document.querySelector('.sidebar')) {
            document.body.prepend(sidebar);
        }
    },

    highlightCurrentPage: () => {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '');

        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });
    }
};

// Add Sidebar Styles dynamically to avoid polluting style.css too much?
// No, let's keep it in style.css for cleanliness.
// But we need to make sure the pages link this script.

document.addEventListener('DOMContentLoaded', App.init);
