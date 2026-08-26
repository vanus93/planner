const STORAGE_KEY = 'vanus-todo-planner-v1';
const THEME_KEY = 'vanus-todo-theme';

const form = document.querySelector('#todoForm');
const input = document.querySelector('#todoInput');
const list = document.querySelector('#todoList');
const template = document.querySelector('#todoTemplate');
const count = document.querySelector('#todoCount');
const clearCompleted = document.querySelector('#clearCompleted');
const themeToggle = document.querySelector('#themeToggle');
const filterButtons = [...document.querySelectorAll('.filter')];

let todos = loadTodos();
let currentFilter = 'all';

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function filteredTodos() {
  if (currentFilter === 'active') return todos.filter(todo => !todo.completed);
  if (currentFilter === 'completed') return todos.filter(todo => todo.completed);
  return todos;
}

function render() {
  list.innerHTML = '';
  const visible = filteredTodos();

  if (!visible.length) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = currentFilter === 'completed'
      ? 'Belum ada tugas yang selesai.'
      : currentFilter === 'active'
        ? 'Tidak ada tugas aktif. Mantap!'
        : 'Belum ada tugas. Tambahkan tugas pertamamu.';
    list.appendChild(empty);
  }

  visible.forEach(todo => {
    const node = template.content.cloneNode(true);
    const item = node.querySelector('.todo-item');
    const checkbox = node.querySelector('.todo-check');
    const text = node.querySelector('.todo-text');
    const deleteButton = node.querySelector('.delete-button');

    item.classList.toggle('completed', todo.completed);
    checkbox.checked = todo.completed;
    text.textContent = todo.text;

    checkbox.addEventListener('change', () => {
      todo.completed = checkbox.checked;
      saveTodos();
      render();
    });

    deleteButton.addEventListener('click', () => {
      todos = todos.filter(item => item.id !== todo.id);
      saveTodos();
      render();
    });

    list.appendChild(node);
  });

  const activeCount = todos.filter(todo => !todo.completed).length;
  count.textContent = `${activeCount} tugas aktif`;
  clearCompleted.disabled = !todos.some(todo => todo.completed);
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  todos.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    text,
    completed: false,
    createdAt: Date.now()
  });

  saveTodos();
  input.value = '';
  input.focus();
  currentFilter = 'all';
  syncFilterButtons();
  render();
});

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    syncFilterButtons();
    render();
  });
});

function syncFilterButtons() {
  filterButtons.forEach(button => button.classList.toggle('active', button.dataset.filter === currentFilter));
}

clearCompleted.addEventListener('click', () => {
  todos = todos.filter(todo => !todo.completed);
  saveTodos();
  render();
});

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? '☀' : '☾';
  localStorage.setItem(THEME_KEY, theme);
}

const savedTheme = localStorage.getItem(THEME_KEY);
const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
setTheme(savedTheme || preferredTheme);

themeToggle.addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

render();
