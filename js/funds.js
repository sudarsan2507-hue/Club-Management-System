/**
 * funds.js
 * Handles fund tracking and calculations.
 */

const Funds = {
    currentUser: null,

    init: () => {
        Funds.currentUser = Auth.requireAuth();
        if (!Funds.currentUser) return;

        Funds.renderUI();
        Funds.renderData();
        Funds.setupEventListeners();
    },

    renderUI: () => {
        if (Funds.currentUser.role === 'admin') {
            document.getElementById('adminControls').style.display = 'block';
        }
    },

    setupEventListeners: () => {
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            Funds.saveTransaction();
        });
    },

    getFunds: () => {
        return Storage.get(DB_KEYS.FUNDS) || [];
    },

    renderData: () => {
        const funds = Funds.getFunds().sort((a, b) => new Date(b.date) - new Date(a.date));

        let total = 0;
        let income = 0;
        let expense = 0;

        const list = document.getElementById('transactionsList');
        list.innerHTML = '';

        funds.forEach(t => {
            if (t.type === 'income') {
                total += t.amount;
                income += t.amount;
            } else {
                total -= t.amount;
                expense += t.amount;
            }

            const div = document.createElement('div');
            div.className = 'transaction-item fade-in';
            div.innerHTML = `
                <div style="display: flex; align-items: center;">
                    <div class="t-icon ${t.type === 'income' ? 't-income' : 't-expense'}">
                        ${t.type === 'income' ? '↓' : '↑'}
                    </div>
                    <div>
                        <div style="font-weight: 500;">${t.description}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">${new Date(t.date).toLocaleDateString()}</div>
                    </div>
                </div>
                <div class="t-amount" style="color: ${t.type === 'income' ? 'var(--success)' : 'var(--text-main)'}">
                    ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
                </div>
            `;
            list.appendChild(div);
        });

        document.getElementById('totalBalance').textContent = `$${total.toFixed(2)}`;
        document.getElementById('totalIncome').textContent = `$${income.toFixed(2)}`;
        document.getElementById('totalExpense').textContent = `$${expense.toFixed(2)}`;

        if (funds.length === 0) {
            list.innerHTML = `<p style="padding: 2rem; text-align: center; color: var(--text-muted)">No transactions recorded.</p>`;
        }
    },

    openModal: () => {
        const modal = document.getElementById('transactionModal');
        const form = document.getElementById('transactionForm');
        form.reset();
        document.getElementById('tDate').valueAsDate = new Date();
        modal.classList.add('open');
    },

    closeModal: () => {
        document.getElementById('transactionModal').classList.remove('open');
    },

    saveTransaction: () => {
        const type = document.getElementById('tType').value;
        const amount = parseFloat(document.getElementById('tAmount').value);
        const description = document.getElementById('tDesc').value;
        const date = document.getElementById('tDate').value; // YYYY-MM-DD

        const newTrans = {
            id: Date.now().toString(),
            type,
            amount,
            description,
            date
        };

        const funds = Funds.getFunds();
        funds.push(newTrans);
        Storage.set(DB_KEYS.FUNDS, funds);

        Funds.closeModal();
        Funds.renderData();
    }
};

document.addEventListener('DOMContentLoaded', Funds.init);
