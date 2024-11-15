'use client';

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepsProps {
  currentStep: number;
  steps: {
    id: number;
    name: string;
    description: string;
  }[];
}

export function Steps({ currentStep, steps }: StepsProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step) => (
          <li key={step.name} className="md:flex-1">
            <div className={cn(
              "group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
              step.id < currentStep
                ? "border-primary"
                : step.id === currentStep
                ? "border-primary"
                : "border-gray-200"
            )}>
              <span className="text-sm font-medium">
                {step.id < currentStep ? (
                  <span className="flex items-center text-primary">
                    <Check className="mr-2 h-4 w-4" />
                    {step.name}
                  </span>
                ) : step.id === currentStep ? (
                  <span className="text-primary">{step.name}</span>
                ) : (
                  <span className="text-gray-500">{step.name}</span>
                )}
              </span>
              <span className={cn(
                "text-sm",
                step.id === currentStep ? "text-primary" : "text-gray-500"
              )}>
                {step.description}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
} 