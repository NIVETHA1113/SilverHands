import React from 'react';
import { Check } from 'lucide-react';

const steps = [
  { id: 1, name: 'About You' },
  { id: 2, name: 'Skills' },
  { id: 3, name: 'Location' },
  { id: 4, name: 'Languages' },
  { id: 5, name: 'Preferences' },
  { id: 6, name: 'Review' }
];

export default function ProgressIndicator({ currentStep, onStepClick }) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* Mobile Step Header */}
      <div className="flex justify-between items-center mb-3 sm:hidden px-2">
        <span className="text-xs font-bold text-[#C86D51] tracking-wider uppercase">
          Step {currentStep} of 6
        </span>
        <span className="font-editorial text-sm font-bold text-[#16382B]">
          {steps.find(s => s.id === currentStep)?.name}
        </span>
      </div>

      {/* Step Bar Lines */}
      <div className="grid grid-cols-6 gap-2 sm:gap-3">
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <div
              key={step.id}
              onClick={() => isCompleted && onStepClick && onStepClick(step.id)}
              className={`flex flex-col gap-1.5 transition-all ${
                isCompleted ? 'cursor-pointer group' : ''
              }`}
            >
              <div
                className={`h-2 rounded-full transition-all ${
                  isCompleted
                    ? 'bg-[#16382B]'
                    : isCurrent
                    ? 'bg-[#C86D51]'
                    : 'bg-[#E2E7E3]'
                }`}
              />
              <span
                className={`hidden sm:block text-xs font-semibold truncate ${
                  isCurrent
                    ? 'text-[#C86D51]'
                    : isCompleted
                    ? 'text-[#16382B] group-hover:underline'
                    : 'text-slate-400'
                }`}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
