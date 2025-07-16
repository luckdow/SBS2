'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import type { StepIndicatorProps } from '../types/reservation';

/**
 * Modern step indicator bileşeni
 * 5 adımlı rezervasyon akışını görsel olarak temsil eder
 */
export default function StepIndicator({ currentStep, stepNames }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: 5 }, (_, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <motion.div 
                initial={{ scale: 0.8 }} 
                animate={{ scale: currentStep >= index + 1 ? 1 : 0.8 }} 
                transition={{ duration: 0.3 }}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm relative ${
                  currentStep >= index + 1 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'bg-white/20 text-white/60'
                }`}
              >
                {currentStep > index + 1 ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  index + 1
                )}
                {currentStep >= index + 1 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-75 animate-pulse"></div>
                )}
              </motion.div>
              <span className={`mt-3 text-sm font-medium ${
                currentStep >= index + 1 ? 'text-white' : 'text-white/60'
              }`}>
                {stepNames[index]}
              </span>
            </div>
            {index < 4 && (
              <div className="flex-1 h-1 mx-4 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: '0%' }} 
                  animate={{ width: currentStep > index + 1 ? '100%' : '0%' }} 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" 
                  transition={{ duration: 0.5 }} 
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}