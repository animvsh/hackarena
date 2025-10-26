import { ReactNode } from 'react';

interface OnboardingQuestionProps {
  question: string;
  subtitle?: string;
  children: ReactNode;
}

export const OnboardingQuestion = ({ question, subtitle, children }: OnboardingQuestionProps) => {
  return (
    <div className="space-y-12 text-center">
      <div className="space-y-4">
        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
          {question}
        </h1>
        {subtitle && (
          <p className="text-xl text-white/70 max-w-lg mx-auto">
            {subtitle}
          </p>
        )}
      </div>
      <div className="mt-12">
        {children}
      </div>
    </div>
  );
};
