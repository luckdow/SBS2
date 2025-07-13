import React from 'react';
import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps, stepNames }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: currentStep >= index + 1 ? 1 : 0.8 }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  ${currentStep >= index + 1 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {index + 1}
              </motion.div>
              <span className={`mt-2 text-sm font-medium ${
                currentStep >= index + 1 ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {stepNames[index]}
              </span>
            </div>
            {index < totalSteps - 1 && (
              <div className="flex-1 h-0.5 mx-4 bg-gray-200">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: currentStep > index + 1 ? '100%' : '0%' }}
                  className="h-full bg-blue-600"
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};