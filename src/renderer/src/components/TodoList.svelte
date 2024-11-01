<script>
    import { writable } from 'svelte/store';
    import { Button, TextInput, Accordion } from '@svelteuidev/core';
    import { Pencil1, ArrowRight, ArrowLeft } from 'radix-icons-svelte';

    let taskName = '';

    const STATES = ["TODO", "ONGOING", "DONE"];
  
    // Store to manage todos
    let todos = writable([]);

    var fetching = false;
  
    const user = localStorage.getItem('todo-user');

    async function addTodo() {
        if (user && taskName) {
            todos.update((allTodos) => [
            ...allTodos,
            {
                id: Date.now(),
                task: taskName,
                user,
                state: STATES[0], // Initial state: TODO
                lastUpdated: new Date().toLocaleString(),
            },
            ]);
            taskName = '';
        }
    }

    todos.subscribe(async (value) => {
        if (fetching) {
            return;
        }
        if (value && value.length === 0) {
            return;
        }
        await sync(user, value);
    });
  
    function promote(todo) {
      todos.update((allTodos) => {
        const index = allTodos.findIndex((t) => t.id === todo.id);
        if (index !== -1) {
          const task = allTodos[index];
          if (task.state === STATES[STATES.length - 1]) {
            return allTodos;
          }
          allTodos[index].state = STATES[(STATES.indexOf(allTodos[index].state) + 1) % STATES.length];
          allTodos[index].lastUpdated = new Date().toLocaleString();
        }
        return allTodos;
      });
    }

    function demote(todo) {
      todos.update((allTodos) => {
        const index = allTodos.findIndex((t) => t.id === todo.id);
        const task = allTodos[index];
          if (task.state === STATES[0]) {
            return allTodos;
          }
        if (index !== -1) {
          allTodos[index].state = STATES[(STATES.indexOf(allTodos[index].state) - 1) % STATES.length];
          allTodos[index].lastUpdated = new Date().toLocaleString();
        }
        return allTodos;
      });
    }

    function getNextState(state) {
        if (state === STATES[STATES.length - 1]) {
            return undefined;
          }
        return STATES[(STATES.indexOf(state) + 1) % STATES.length];
    }

    function getPrevState(state) {
        return STATES[(STATES.indexOf(state) - 1) % STATES.length];
    }

    async function fetchTodos(user) {
        const request = await fetch('http://localhost:3001/todos?user=' + user);
        const todoList = await request.json();
        console.log(todoList);
        if (todoList && todoList.length > 0) {
            fetching = true;
            todos.set(todoList);
            fetching = false;
        }
    }

    fetchTodos(user);

    async function sync(user, todos) {
        const request = new Request('http://localhost:3001/todos?user=' + user, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(todos),
        });
        const res = await fetch(request);
        const response = await res.json();
        console.log(response);
    }
  </script>
  
  <div class="todo">
    <div class="enter">
        <TextInput 
            bind:value={taskName} 
            placeholder="Enter a Task" 
            icon={Pencil1} 
            class='enter-input' 
            className='input'
        />
        <Button on:click={addTodo}>
            Add
        </Button>
    </div>
  
    <Accordion>
    {#each $todos as todo (todo.id)}
        <Accordion.Item value={todo.id}>
            <div slot="control">
                <div>
                    {todo.task}
                </div>
            </div>
            <div>
                <b>Status:</b> {todo.state}
            </div>
            <div class="actions">
                {#if getPrevState(todo.state)}
                <Button on:click={() => demote(todo)}>{getPrevState(todo.state)}
                    <ArrowLeft slot="leftIcon" />
                </Button>
                {/if}
                {#if getNextState(todo.state)}
                <Button on:click={() => promote(todo)}>{getNextState(todo.state)}
                    <ArrowRight slot="rightIcon" />
                </Button>
                {/if}
            </div>
        </Accordion.Item>
    {/each}
    </Accordion>
  </div>
  
  <style>
    .actions {
        display: flex;
        gap: 1rem;
        justify-content: space-between;
    }
    .enter {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 50%;
    }
    .todo {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
  </style>
  