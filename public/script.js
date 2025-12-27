// ===== Configuration =====
const API_URL = 'http://localhost:5000/api';
let currentToken = localStorage.getItem('token');
let currentUser = localStorage.getItem('username');
let currentUserId = localStorage.getItem('userId');
let allTasks = [];
let selectedCategory = null;
let editingTaskId = null;
let currentView = localStorage.getItem('taskView') || 'grid';

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkAuthStatus();
});

function setupEventListeners() {
    // ... (Auth and Task events remain the same) ...
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('signupBtn').addEventListener('click', handleSignup);
    document.getElementById('toggleSignup').addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthScreens();
    });
    document.getElementById('toggleLogin').addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthScreens();
    });

    document.getElementById('addTaskBtn').addEventListener('click', openTaskModal);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('saveTaskBtn').addEventListener('click', (e) => {
        e.preventDefault();
        saveTask();
    });
    document.getElementById('cancelTaskBtn').addEventListener('click', closeTaskModal);
    document.querySelector('.modal-close').addEventListener('click', closeTaskModal);

    // ===== CHANGED SECTION START =====
    // Priority filters
    document.querySelectorAll('.priority-filter').forEach(checkbox => {
        checkbox.addEventListener('change', filterTasks);
    });

    // Status filters
    document.getElementById('showCompleted').addEventListener('change', filterTasks);

    // Link 'Active' (Incomplete) with 'Overdue'
    document.getElementById('showIncomplete').addEventListener('change', function(e) {
        if (this.checked) {
            // Automatically select Overdue when Active is selected
            const overdueBtn = document.getElementById('showOverdue');
            if (overdueBtn) overdueBtn.checked = true;
        }
        filterTasks();
    });

    // Make sure Overdue also triggers the filter when clicked manually
    const overdueCheckbox = document.getElementById('showOverdue');
    if (overdueCheckbox) {
        overdueCheckbox.addEventListener('change', filterTasks);
    }
    // ===== CHANGED SECTION END =====

    document.getElementById('sortBy').value = 'priority';
    const sortByInput = document.getElementById('sortBy');
    sortByInput.value = 'priority'; 
    sortByInput.addEventListener('change', filterTasks);

    // View toggle events
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.closest('.view-btn').dataset.view;
            setView(view);
        });
    });

    // Enter key listeners
    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    document.getElementById('regPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSignup();
    });
    document.getElementById('regEmail').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSignup();
    });
}

function checkAuthStatus() {
    if (currentToken && currentUser) {
        showMainApp();
        loadTasks();
    } else {
        showAuthScreen();
    }
}

// ===== Authentication Functions =====
function toggleAuthScreens() {
    document.getElementById('loginForm').classList.toggle('hidden');
    document.getElementById('signupScreen').classList.toggle('hidden');
    clearAuthForms();
}

function clearAuthForms() {
    document.getElementById('loginUsernameOrEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('regUsername').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('loginError').innerHTML = '';
    document.getElementById('signupError').innerHTML = '';
}

async function handleLogin() {
    const usernameOrEmail = document.getElementById('loginUsernameOrEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const errorDiv = document.getElementById('loginError');

    if (!usernameOrEmail || !password) {
        showError(errorDiv, 'Please fill in all fields');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernameOrEmail, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showError(errorDiv, data.message || 'Login failed');
            return;
        }

        // Store auth data
        currentToken = data.token;
        currentUser = data.username;
        currentUserId = data.userId;
        localStorage.setItem('token', currentToken);
        localStorage.setItem('username', currentUser);
        localStorage.setItem('userId', currentUserId);

        showMainApp();
        loadTasks();
        clearAuthForms();
    } catch (err) {
        showError(errorDiv, 'Connection error. Make sure backend is running.');
    }
}

async function handleSignup() {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const errorDiv = document.getElementById('signupError');

    if (!username || !email || !password) {
        showError(errorDiv, 'Please fill in all fields');
        return;
    }

    if (username.length < 3) {
        showError(errorDiv, 'Username must be at least 3 characters');
        return;
    }

    if (password.length < 6) {
        showError(errorDiv, 'Password must be at least 6 characters');
        return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError(errorDiv, 'Please enter a valid email address');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showError(errorDiv, data.message || 'Signup failed');
            return;
        }

        // Store auth data
        currentToken = data.token;
        currentUser = data.username;
        currentUserId = data.userId;
        localStorage.setItem('token', currentToken);
        localStorage.setItem('username', currentUser);
        localStorage.setItem('userId', currentUserId);

        showMainApp();
        loadTasks();
        clearAuthForms();
    } catch (err) {
        showError(errorDiv, 'Connection error. Make sure backend is running.');
    }
}

function handleLogout() {
    currentToken = null;
    currentUser = null;
    currentUserId = null;
    allTasks = [];
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    showAuthScreen();
    clearAuthForms();
}

// ===== UI Functions =====
function setView(view) {
    currentView = view;
    localStorage.setItem('taskView', view);
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    filterTasks();
}

function showAuthScreen() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('usernameDisplay').textContent = currentUser;
    initializeView();
}

function initializeView() {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === currentView);
    });
}

function showError(errorDiv, message) {
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    setTimeout(() => {
        errorDiv.classList.remove('show');
    }, 5000);
}

// ===== Task Functions =====
async function loadTasks() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        const response = await fetch(`${API_URL}/tasks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            console.error('Failed to load tasks:', response.status, response.statusText);
            return;
        }

        allTasks = await response.json();
        filterTasks();
        updateCategoriesList();
    } catch (err) {
        console.error('Error loading tasks:', err);
    }
}

function renderTasks(tasksToRender = allTasks) {
    const tasksList = document.getElementById('tasksList');
    const emptyState = document.getElementById('emptyState');

    if (tasksToRender.length === 0) {
        tasksList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    // Pass tasksToRender to the specific view functions
    if (currentView === 'table') {
        renderTableView(tasksList, tasksToRender);
    } else {
        renderGridView(tasksList, tasksToRender);
    }
}

// Updated to accept 'tasks' argument
function renderGridView(tasksList, tasks) {
    tasksList.classList.remove('tasks-table-wrapper');
    tasksList.classList.add('tasks-grid');
    
    // Use 'tasks.map' instead of 'allTasks.map'
    tasksList.innerHTML = tasks.map(task => `
        <div class="task-card ${task.priority} ${task.completed ? 'completed' : ''} ${isOverdue(task.dueDate, task.completed) ? 'overdue' : ''}">
            <div class="task-header">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="toggleTaskComplete('${task._id}', this.checked)">
                <span class="task-title">${escapeHtml(task.title)}</span>
                <span class="task-priority ${task.priority}">${task.priority.toUpperCase()}</span>
            </div>
            ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
            <div class="task-meta">
                ${task.category ? `<span class="task-category">${escapeHtml(task.category)}</span>` : ''}
                ${task.dueDate ? `<span class="task-due-date ${isOverdue(task.dueDate, task.completed) ? 'overdue' : ''}">📅 ${formatDate(task.dueDate)}${isOverdue(task.dueDate, task.completed) ? ' <span class="overdue-badge">OVERDUE</span>' : ''}</span>` : ''}
            </div>
            <div class="task-actions">
                <button class="btn-edit" onclick="editTask('${task._id}')">Edit</button>
                <button class="btn-delete" onclick="deleteTask('${task._id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Updated to accept 'tasks' argument
function renderTableView(tasksList, tasks) {
    tasksList.classList.remove('tasks-grid');
    tasksList.classList.add('tasks-table-wrapper');
    
    // Use 'tasks.map' inside the HTML string instead of 'allTasks.map'
    tasksList.innerHTML = `
        <table class="tasks-table">
            <thead>
                <tr>
                    <th style="width: 40px; text-align: center;">✓</th>
                    <th style="text-align: left;">Title</th>
                    <th style="width: 100px; text-align: center;">Priority</th>
                    <th style="width: 150px; text-align: center;">Category</th>
                    <th style="width: 200px; text-align: center;">Due Date</th>
                    <th style="width: 100px; text-align: center;">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${tasks.map(task => `
                    <tr class="${task.completed ? 'completed' : ''} ${isOverdue(task.dueDate, task.completed) ? 'overdue' : ''}">
                        <td style="text-align: center;">
                            <input type="checkbox" class="task-table-checkbox" ${task.completed ? 'checked' : ''} 
                                   onchange="toggleTaskComplete('${task._id}', this.checked)">
                        </td>
                        <td>
                            <span class="task-table-title ${task.completed ? 'completed' : ''}">${escapeHtml(task.title)}</span>
                        </td>
                        <td style="text-align: center;">
                            <span class="task-table-priority ${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                        </td>
                        <td style="text-align: center;">${task.category ? escapeHtml(task.category) : '-'}</td>
                        <td>
                            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;">
                                ${task.dueDate ? `<span class="${isOverdue(task.dueDate, task.completed) ? 'overdue' : ''}">${formatDate(task.dueDate)}</span>` : '<span>-</span>'}
                                ${isOverdue(task.dueDate, task.completed) ? '<span class="overdue-badge">OVERDUE</span>' : ''}
                            </div>
                        </td>
                        <td style="text-align: center;">
                            <div class="task-table-actions" style="display: flex; justify-content: center; gap: 5px;">
                                <button class="btn-edit" onclick="editTask('${task._id}')">Edit</button>
                                <button class="btn-delete" onclick="deleteTask('${task._id}')">Delete</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function toggleCategory(category) {
    if (selectedCategory === category) {
        selectedCategory = null;
    } else {
        selectedCategory = category;
    }
    updateCategoriesList();
    filterTasks();
}

async function saveTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const priority = document.getElementById('taskPriority').value;
    const category = document.getElementById('taskCategory').value.trim();
    const dueDate = document.getElementById('taskDueDate').value;

    if (!title) {
        alert('Please enter a task title');
        return;
    }

    // Get fresh token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Session expired. Please login again.');
        return;
    }

    const taskData = {
        title,
        description,
        priority,
        category: category || 'General',
        dueDate: dueDate || null
    };

    try {
        const method = editingTaskId ? 'PUT' : 'POST';
        const url = editingTaskId ? `${API_URL}/tasks/${editingTaskId}` : `${API_URL}/tasks`;

        console.log('Saving task:', { method, url, token: token ? 'Present' : 'Missing', taskData });

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to save task');
        }

        closeTaskModal();
        loadTasks();
    } catch (err) {
        console.error('Full error details:', err);
        alert('Error saving task: ' + err.message);
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to delete task');
        }

        loadTasks();
    } catch (err) {
        alert('Error deleting task: ' + err.message);
    }
}

async function toggleTaskComplete(taskId, completed) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ completed })
        });

        if (!response.ok) {
            throw new Error('Failed to update task');
        }

        loadTasks();
    } catch (err) {
        alert('Error updating task: ' + err.message);
    }
}

function editTask(taskId) {
    const task = allTasks.find(t => t._id === taskId);
    if (!task) return;

    editingTaskId = taskId;
    
    // Update UI text
    document.getElementById('modalTitle').textContent = 'Edit Task';

    // Pre-fill existing values
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskCategory').value = task.category;
    
    // Format date for input type="date" (YYYY-MM-DD)
    document.getElementById('taskDueDate').value = task.dueDate ? task.dueDate.split('T')[0] : '';

    openTaskModal();
}

// ===== Modal Functions =====
function openAddModal() {
    editingTaskId = null;
    document.getElementById('modalTitle').textContent = 'Add New Task';
    document.getElementById('taskForm').reset();
    document.getElementById('taskPriority').value = 'medium';
    
    openTaskModal(); 
}

function openTaskModal() {
    document.getElementById('taskModal').classList.remove('hidden');
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.add('hidden');
    document.getElementById('taskForm').reset();
    editingTaskId = null;
}

// ===== Filter & Sort Functions =====
function filterTasks() {
    const selectedPriorities = Array.from(document.querySelectorAll('.priority-filter:checked')).map(cb => cb.value);
    const showCompleted = document.getElementById('showCompleted').checked;
    const showActive = document.getElementById('showIncomplete').checked;
    const showOverdue = document.getElementById('showOverdue').checked;

    let filtered = allTasks.filter(task => {
        const priorityMatch = selectedPriorities.length === 0 || selectedPriorities.includes(task.priority);
        const categoryMatch = !selectedCategory || task.category === selectedCategory;

        const taskIsOverdue = isOverdue(task.dueDate, task.completed);
        const taskIsCompleted = task.completed;
        const taskIsActive = !task.completed && !taskIsOverdue;

        const statusMatch = (taskIsCompleted && showCompleted) || 
                            (taskIsActive && showActive) || 
                            (taskIsOverdue && showOverdue);

        return priorityMatch && statusMatch && categoryMatch;
    });

    const sortBy = document.getElementById('sortBy').value;
    
    switch (sortBy) {
        case 'date-asc':
            filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'due-date':
            filtered.sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
            break;
        case 'date-desc':
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'priority':
        default:
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            break;
    }

    renderTasks(filtered);
}

function sortTasks() {
    const sortBy = document.getElementById('sortBy').value;
    // Create a copy to sort so we don't mutate the original order
    const tasksCopy = [...allTasks]; 

    switch (sortBy) {
        case 'date-asc':
            tasksCopy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'due-date':
            tasksCopy.sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
            break;
        case 'date-desc':
            tasksCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'priority':
        default: 
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            tasksCopy.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            break;
    }

    // Pass the sorted array to renderTasks
    renderTasks(tasksCopy);
}

function updateCategoriesList() {
    const categories = [...new Set(allTasks.map(t => t.category).filter(Boolean))];
    const categoriesList = document.getElementById('categoriesList');

    if (categories.length === 0) {
        categoriesList.innerHTML = '<p style="color: #999; font-size: 13px;">No categories yet</p>';
        return;
    }

    categoriesList.innerHTML = categories.map(cat => `
        <div class="category-tag ${selectedCategory === cat ? 'active' : ''}" 
             onclick="toggleCategory('${cat.replace(/'/g, "\\'")}')">
            ${escapeHtml(cat)}
        </div>
    `).join('');
}

// ===== Utility Functions =====
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(dateString, completed) {
    if (!dateString || completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
}
