/**
 * auth.js
 * Handles user authentication and session management.
 */

const Auth = {
    login: (username, password) => {
        const users = Storage.get(DB_KEYS.USERS) || [];
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            // Store only necessary info in session
            const sessionData = { id: user.id, username: user.username, role: user.role, name: user.name };
            Storage.set(DB_KEYS.SESSION, sessionData);
            return { success: true, user: sessionData };
        }
        return { success: false, message: 'Invalid credentials' };
    },

    logout: () => {
        localStorage.removeItem(DB_KEYS.SESSION);
        window.location.href = '../index.html';
    },

    getCurrentUser: () => {
        return Storage.get(DB_KEYS.SESSION);
    },

    requireAuth: () => {
        const user = Auth.getCurrentUser();
        if (!user) {
            window.location.href = '../index.html';
            return null;
        }
        return user;
    },

    // Redirect if already logged in (for login page)
    redirectIfLoggedIn: () => {
        const user = Auth.getCurrentUser();
        if (user) {
            window.location.href = 'pages/dashboard.html';
        }
    }
};
