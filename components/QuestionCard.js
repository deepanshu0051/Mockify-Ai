'use client';
import Card from './ui/Card';
import Badge from './ui/Badge';

export default function QuestionCard({ question, className = '' }) {
  if (!question) return null;

  return (
    <Card className={`p-5 sm:p-8 border-l-4 border-l-primary ${className}`}>
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <Badge variant={question.difficulty} className="text-[10px] sm:text-sm">{question.difficulty.toUpperCase()}</Badge>
        <span className="text-xs sm:text-sm font-medium text-slate-400 capitalize">{question.topic}</span>
      </div>
      <h3 className="text-lg sm:text-2xl font-semibold text-slate-800 leading-snug">
        {question.question}
      </h3>
    </Card>
  );
}
