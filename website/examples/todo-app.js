import { html } from 'uhtml';
import { val, register, hydrate } from '../front.esm.js';

/**
 * TodoApp Component
 * Demonstrates:
 * - Value-based state management
 * - Reactive rendering with uhtml
 * - Server-rendered initial state via data-props
 * - XSS protection (malicious input is escaped)
 */
function TodoApp(props) {
  // State: Initialize from server-rendered props or empty array
  const todos = val(props.items || []);
  const input = val('');
  
  // Actions
  const addTodo = () => {
    const text = input().trim();
    if (text) {
      // Add new todo to the list
      todos([...todos(), text]);
      // Clear input
      input('');
    }
  };

  const deleteTodo = (index) => {
    const currentTodos = todos();
    todos(currentTodos.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };
  
  // Render function
  return () => html`
    <div>
      <input 
        type="text"
        value=${input()} 
        oninput=${e => input(e.target.value)}
        onkeypress=${handleKeyPress}
        placeholder="New todo..."
      />
      <button onclick=${addTodo}>Add Todo</button>
      ${todos().length === 0 
        ? html`<div class="empty-state">No todos yet. Add one above!</div>`
        : html`
          <ul>
            ${todos().map((todo, index) => html`
              <li>
                <span>${todo}</span>
                <button class="delete-btn" onclick=${() => deleteTodo(index)}>Delete</button>
              </li>
            `)}
          </ul>
        `
      }
    </div>
  `;
}

// Register component
register('TodoApp', TodoApp);

// Hydrate all islands on page load
hydrate();

