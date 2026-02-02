/**
 * members.js
 * Handles member management logic.
 */

const Members = {
    init: () => {
        // Auth check - Admin only
        const user = Auth.requireAuth();
        if (user.role !== 'admin') {
            alert('Access Denied: Admins Only');
            window.location.href = 'dashboard.html';
            return;
        }

        Members.renderTable();
        Members.setupEventListeners();
    },

    setupEventListeners: () => {
        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            Members.renderTable(e.target.value);
        });

        // Form Submit
        document.getElementById('memberForm').addEventListener('submit', (e) => {
            e.preventDefault();
            Members.saveMember();
        });
    },

    getMembers: () => {
        return Storage.get(DB_KEYS.MEMBERS) || [];
    },

    renderTable: (searchQuery = '') => {
        const tbody = document.getElementById('membersTableBody');
        tbody.innerHTML = '';

        let members = Members.getMembers();

        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            members = members.filter(m =>
                m.name.toLowerCase().includes(lowerQ) ||
                m.email.toLowerCase().includes(lowerQ)
            );
        }

        members.forEach(member => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div style="font-weight: 500">${member.name}</div>
                </td>
                <td style="color: var(--text-muted)">${member.email}</td>
                <td style="color: var(--text-muted)">${new Date(member.joinDate).toLocaleDateString()}</td>
                <td>
                    <span class="status-badge ${member.status === 'Active' ? 'status-active' : 'status-inactive'}">
                        ${member.status}
                    </span>
                </td>
                <td>
                    <button class="action-btn edit" onclick="Members.openModal('${member.id}')">✏️</button>
                    <button class="action-btn delete" onclick="Members.deleteMember('${member.id}')">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        if (members.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted)">No members found.</td></tr>`;
        }
    },

    openModal: (id = null) => {
        const modal = document.querySelector('.modal-overlay');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('memberForm');

        if (id) {
            // Edit Mode
            const members = Members.getMembers();
            const member = members.find(m => m.id === id);
            if (!member) return;

            title.textContent = 'Edit Member';
            document.getElementById('memberId').value = member.id;
            document.getElementById('memberName').value = member.name;
            document.getElementById('memberEmail').value = member.email;
            document.getElementById('memberStatus').value = member.status;
        } else {
            // Add Mode
            title.textContent = 'Add Member';
            form.reset();
            document.getElementById('memberId').value = '';
            // Default Join Date set on save
        }

        modal.classList.add('open');
    },

    closeModal: () => {
        document.querySelector('.modal-overlay').classList.remove('open');
    },

    saveMember: () => {
        const id = document.getElementById('memberId').value;
        const name = document.getElementById('memberName').value;
        const email = document.getElementById('memberEmail').value;
        const status = document.getElementById('memberStatus').value;

        const members = Members.getMembers();

        if (id) {
            // Update
            const index = members.findIndex(m => m.id === id);
            if (index !== -1) {
                members[index] = { ...members[index], name, email, status };
            }
        } else {
            // Create
            const newMember = {
                id: Date.now().toString(),
                name,
                email,
                status,
                joinDate: new Date().toISOString()
            };
            members.push(newMember);
        }

        Storage.set(DB_KEYS.MEMBERS, members);
        Members.closeModal();
        Members.renderTable();
    },

    deleteMember: (id) => {
        if (confirm('Are you sure you want to remove this member?')) {
            let members = Members.getMembers();
            members = members.filter(m => m.id !== id);
            Storage.set(DB_KEYS.MEMBERS, members);
            Members.renderTable();
        }
    }
};

document.addEventListener('DOMContentLoaded', Members.init);
