import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Context Providers
import { ThemeProvider } from './contexts/ThemeContext';
import { HabitProvider } from './contexts/HabitContext';
import { GamificationProvider } from './contexts/GamificationContext';
import { ToastProvider } from './components/ui/Toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <HabitProvider>
            <GamificationProvider>
              <App />
            </GamificationProvider>
          </HabitProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
