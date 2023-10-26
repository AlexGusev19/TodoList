let todoList = document.querySelector('#todo-list');
let userSelect = document.querySelector('#user-todo');
let form = document.querySelector('form');
let todos = [];
let users = [];

// Рендеринг UL и Option данными с сервера
document.addEventListener('DOMContentLoaded', rendering);

function rendering() {
	
	getData('users').then(values => {
		users = values;
		values.forEach(user => addUserOption(user));
		
		getData('todos').then(values => {
			todos = values;
			values.forEach(todo => addTodoLi(todo));
		});
	});		
	
}

// Получение данных с сервера
async function getData(elems) {
	try {
		
		let response = await fetch(`https://jsonplaceholder.typicode.com/${elems}`);
		let data = await response.json();
		
		if (response.ok) {
			return data;
		} else {
			throw new Error('Запрос на сервер неудачный!');
		}
		
	} catch(error) {
		alert(error.message);
	}
}

// Добавление LI в список UL
function addTodoLi({id, userId, title, completed}) {	
	let li = document.createElement('li');
	li.className = 'todo-item';
	li.dataset.id = id;
	let userName = users.find(user => user.id === userId).name;
	li.innerHTML = `<span>${title} <i>by</i> <b>${userName}</b></span>`;
	
	let checkBox = document.createElement('input');
	checkBox.type = 'checkbox';
	checkBox.checked = completed;
	checkBox.addEventListener('change', handleTodoComplete);
	li.prepend(checkBox);
	
	let deleteBn = document.createElement('span');
	deleteBn.innerText = 'x';
	deleteBn.className = 'close';
	deleteBn.addEventListener('click', handleTodoDelete);	
	li.append(deleteBn);
	
	todoList.prepend(li);
}

// Добавление Option в список Select
function addUserOption({id, name}) {
	let option = document.createElement('option');
	option.value = id;
	option.innerText = name;
	
	userSelect.append(option);
}

// Обработка отправки формы
form.addEventListener('submit', handleSubmit);

function handleSubmit(event) {
	event.preventDefault();
	
	let todo = {
		userId: +form.user.value,
		title: form.todo.value,
		completed: false
	};
	
	postTodo(todo);		
}

function handleTodoComplete(event) {
	this.checked = !this.checked;	
	
	toggleTodoComplete(this.parentElement.dataset.id, !this.checked, event.target);	
}

function handleTodoDelete() {	
	deleteTodo(this.parentElement.dataset.id);
}

// Добавление Todo методом POST
async function postTodo(todo) {
	try {
		let response = await fetch('https://jsonplaceholder.typicode.com/todos', {
			method: 'POST',			
			headers: {
				'Content-Type': 'application/json', 
			},
			body: JSON.stringify(todo)
		});
		
		let data = await response.json();
		
		if (response.ok) {
			addTodoLi(data);		
			form.user.selectedIndex = 0;
			form.todo.value = '';
		} else {
			throw new Error('Запрос на сервер неудачный!');
		}
		
		
	} catch(error) {
		alert(error.message);
	}	
}

// Обновление статуса выполнения Todo
async function toggleTodoComplete(todoId, completed, checkbox) {
	try {
		
		let response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
			method: 'PATCH',			
			headers: {
				'Content-Type': 'application/json', 
			},
			body: JSON.stringify({completed})
		});
		
		if (response.ok) {
			checkbox.checked = completed;
		} else {
			throw new Error('Запрос на сервер неудачный!');
		}
		
	} catch(error) {
		alert(error.message);
	}
}

// Удаление Todo на сервере, потом из DOM 
async function deleteTodo(todoId) {
	try {
		
		let response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json', 
			}
		});

		if (response.ok) {			
			todos = todos.filter(todo => todo.id !== todoId);
			let todo = todoList.querySelector(`[data-id="${todoId}"]`);
			todo.querySelector('input').removeEventListener('change', handleTodoComplete);
			todo.querySelector('.close').removeEventListener('click', handleTodoDelete);	
			todo.remove();
		} else {
			throw new Error('Запрос на сервер неудачный!');
		}
		
	} catch(error) {
		alert(error.message);
	}
	
}	

