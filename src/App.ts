// src/App.tsx
import React, { useState } from 'react';
import { ScaleConfig, Notation, ScaleType } from './services/scaleEngine';
import { Home } from './components/Home';
import { Quiz } from './components/Quiz';
import { Settings } from './components/Settings';
import { useLocalStorage } from './hooks/useLocalStorage';
import './index.css';

export type AppScreen = 'home' | 'quiz' | 'settings';

const defaultConfig: ScaleConfig = {
  scaleType: 'major',
  notation: 'latin',
  difficulty: 'medium'
};

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [config, setConfig] = useLocalStorage<ScaleConfig>('scale-quiz-config', defaultConfig);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home onStartQuiz={() => setCurrentScreen('quiz')} onOpenSettings={() => setCurrentScreen('settings')} />;
      case 'quiz':
        return <Quiz config={config} onBack={() => setCurrentScreen('home')} />;
      case 'settings':
        return <Settings config={config} onConfigChange={setConfig} onBack={() => setCurrentScreen('home')} />;
      default:
        return <Home onStartQuiz={() => setCurrentScreen('quiz')} onOpenSettings={() => setCurrentScreen('settings')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400">
            Treine seus graus musicais
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
            Identifique o Nº grau de uma escala — pratique escalas maiores, menores e modos
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {renderScreen()}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400">
          <p>Funciona offline! • Desenvolvido para músicos</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
