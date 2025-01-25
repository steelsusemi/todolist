'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

type FilterType = 'all' | 'active' | 'completed';

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos, isInitialized]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    if (todos.some(todo => todo.text === newTodo.trim())) {
      alert('이미 존재하는 할 일입니다!');
      return;
    }

    setTodos([
      ...todos,
      {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
      },
    ]);
    setNewTodo('');
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  if (!isInitialized) {
    return (
      <motion.div 
        className="p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex justify-center">
          <motion.div 
            className="w-8 h-8 border-t-2 border-blue-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2 
        className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text"
      >
        할 일 목록
      </motion.h2>
      
      <form onSubmit={addTodo} className="mb-6">
        <div className="flex gap-2">
          <motion.input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="새로운 할 일을 입력하세요"
            className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            whileFocus={{ scale: 1.01 }}
          />
          <motion.button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            추가
          </motion.button>
        </div>
      </form>

      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'completed'] as const).map((filterType) => (
          <motion.button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg ${
              filter === filterType
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {filterType === 'all' ? '전체' : filterType === 'active' ? '미완료' : '완료'}
          </motion.button>
        ))}
      </div>

      {isInitialized && (
        <motion.ul className="space-y-3">
          <AnimatePresence mode='popLayout'>
            {filteredTodos.map(todo => (
              <motion.li
                key={todo.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50"
              >
                <div className="flex items-center gap-3">
                  <motion.input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-5 h-5 rounded border-gray-500 text-blue-500 focus:ring-blue-500 bg-gray-700"
                    whileHover={{ scale: 1.2 }}
                  />
                  <motion.span
                    className={`text-gray-200 ${
                      todo.completed ? 'line-through text-gray-500' : ''
                    }`}
                    animate={{ opacity: todo.completed ? 0.6 : 1 }}
                  >
                    {todo.text}
                  </motion.span>
                </div>
                <motion.button
                  onClick={() => deleteTodo(todo.id)}
                  className="px-3 py-1 text-red-400 hover:text-red-300 rounded-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  삭제
                </motion.button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </motion.div>
  );
} 