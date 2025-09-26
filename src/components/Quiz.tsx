// src/components/Quiz.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { ScaleConfig, Question, Answer } from '../services/scaleEngine';
import { scaleEngine } from '../services/scaleEngine';
import { QuestionCard } from './QuestionCard';
import { Scoreboard } from './Scoreboard';

interface QuizProps {
  config: ScaleConfig;
  onBack: () => void;
}

interface QuizStats {
  correct: number;
  incorrect: number;
  streak: number;
  bestStreak: number;
  history: Array<{
    question: Question;
    answer: Answer;
    timestamp: number;
  }>;
}

export const Quiz: React.FC<QuizProps> = ({ config, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<Answer | null>(null);
  const [stats, setStats] = useState<QuizStats>({
    correct: 0,
    incorrect: 0,
    streak: 0,
    bestStreak: 0,
    history: []
  });

  const generateNewQuestion = useCallback(() => {
    const question = scaleEngine.generateQuestion(config);
    setCurrentQuestion(question);
    setUserAnswer('');
    setIsAnswered(false);
    setCurrentAnswer(null);
  }, [config]);

  useEffect(() => {
    generateNewQuestion();
  }, [generateNewQuestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion || !userAnswer.trim()) return;

    const correctNote = scaleEngine.getDegreeNote(
      currentQuestion.tonic,
      currentQuestion.degree,
      currentQuestion.scaleType,
      config.notation
    );

    const isCorrect = scaleEngine.validateAnswer(userAnswer, correctNote, config.notation);
    const explanation = scaleEngine.getExplanation(currentQuestion, correctNote);

    const answer: Answer = {
      userAnswer,
      correctAnswer: correctNote,
      isCorrect,
      explanation
    };

    setCurrentAnswer(answer);
    setIsAnswered(true);

    // Atualizar estatísticas
    setStats(prev => {
      const newCorrect = prev.correct + (isCorrect ? 1 : 0);
      const newIncorrect = prev.incorrect + (isCorrect ? 0 : 1);
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const newBestStreak = Math.max(prev.bestStreak, newStreak);
      
      const newHistory = [...prev.history, {
        question: currentQuestion,
        answer,
        timestamp: Date.now()
      }].slice(-50); // Manter apenas últimas 50 respostas

      return {
        correct: newCorrect,
        incorrect: newIncorrect,
        streak: newStreak,
        bestStreak: newBestStreak,
        history: newHistory
      };
    });
  };

  const handleNext = () => {
    generateNewQuestion();
  };

  const handleRepeat = () => {
    setUserAnswer('');
    setIsAnswered(false);
    setCurrentAnswer(null);
  };

  if (!currentQuestion) return <div>Carregando...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          ← Voltar
        </button>
        <Scoreboard stats={stats} />
      </div>

      <QuestionCard
        question={currentQuestion}
        userAnswer={userAnswer}
        onAnswerChange={setUserAnswer}
        onSubmit={handleSubmit}
        isAnswered={isAnswered}
        answer={currentAnswer}
        onNext={handleNext}
        onRepeat={handleRepeat}
      />
    </div>
  );
};
