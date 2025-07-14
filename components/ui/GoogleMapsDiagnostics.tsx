'use client'

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, ExternalLink, Copy, Settings, Cloud, Key, CreditCard } from 'lucide-react';
import { GoogleMapsService } from '../../lib/services/googleMaps';
import { getGoogleMapsApiDiagnostics, validateGoogleMapsApiKey } from '../../lib/googleMapsLoader';

interface GoogleMapsDiagnosticsProps {
  onClose?: () => void;
}

export default function GoogleMapsDiagnostics({ onClose }: GoogleMapsDiagnosticsProps) {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [apiValidation, setApiValidation] = useState<any>(null);
  const [serviceValidation, setServiceValidation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('status');

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    
    try {
      const diagnosticInfo = getGoogleMapsApiDiagnostics();
      const keyValidation = await validateGoogleMapsApiKey();
      const serviceValidation = await GoogleMapsService.validateApiConfiguration();
      
      setDiagnostics(diagnosticInfo);
      setApiValidation(keyValidation);
      setServiceValidation(serviceValidation);
    } catch (error) {
      console.error('Error running diagnostics:', error);
    }
    
    setLoading(false);
  };

  const copyApiKey = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    navigator.clipboard.writeText(apiKey);
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-3 text-white">Running Google Maps API diagnostics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
          <Settings className="h-6 w-6" />
          <span>Google Maps API Diagnostics</span>
        </h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6 border-b border-white/20">
        {[
          { key: 'status', label: 'Status', icon: AlertCircle },
          { key: 'setup', label: 'Setup Guide', icon: Cloud },
          { key: 'testing', label: 'API Testing', icon: Key }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === key 
                ? 'border-blue-500 text-white' 
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Status Tab */}
      {activeTab === 'status' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3 flex items-center">
                <Key className="h-4 w-4 mr-2" />
                API Key Status
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Configured:</span>
                  <span className={`flex items-center ${diagnostics?.apiKeyConfigured ? 'text-green-400' : 'text-red-400'}`}>
                    {diagnostics?.apiKeyConfigured ? <CheckCircle className="h-4 w-4 mr-1" /> : <AlertCircle className="h-4 w-4 mr-1" />}
                    {diagnostics?.apiKeyConfigured ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Key Prefix:</span>
                  <span className="text-white">{diagnostics?.apiKeyPrefix}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Script Loaded:</span>
                  <span className={`flex items-center ${diagnostics?.isLoaded ? 'text-green-400' : 'text-red-400'}`}>
                    {diagnostics?.isLoaded ? <CheckCircle className="h-4 w-4 mr-1" /> : <AlertCircle className="h-4 w-4 mr-1" />}
                    {diagnostics?.isLoaded ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3 flex items-center">
                <Cloud className="h-4 w-4 mr-2" />
                API Validation
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Key Valid:</span>
                  <span className={`flex items-center ${apiValidation?.isValid ? 'text-green-400' : 'text-red-400'}`}>
                    {apiValidation?.isValid ? <CheckCircle className="h-4 w-4 mr-1" /> : <AlertCircle className="h-4 w-4 mr-1" />}
                    {apiValidation?.isValid ? 'Yes' : 'No'}
                  </span>
                </div>
                {apiValidation?.error && (
                  <div className="text-red-400 text-xs">
                    {apiValidation.error}
                  </div>
                )}
                {apiValidation?.details && (
                  <div className="text-white/60 text-xs">
                    {apiValidation.details}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Service Status */}
          {serviceValidation && (
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3">Required APIs Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {Object.entries(serviceValidation.results).map(([service, result]: [string, any]) => (
                  <div key={service} className="flex items-center justify-between">
                    <span className="text-white/70 capitalize">{service}:</span>
                    <span className={`flex items-center ${result.status === 'OK' ? 'text-green-400' : 'text-red-400'}`}>
                      {result.status === 'OK' ? <CheckCircle className="h-4 w-4 mr-1" /> : <AlertCircle className="h-4 w-4 mr-1" />}
                      {result.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {serviceValidation?.recommendations && serviceValidation.recommendations.length > 0 && (
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
              <h4 className="text-blue-200 font-medium mb-2">Recommendations</h4>
              <ul className="space-y-1 text-sm text-blue-200/90">
                {serviceValidation.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Setup Guide Tab */}
      {activeTab === 'setup' && (
        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="text-white font-medium mb-4 flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Google Cloud Console Setup
            </h4>
            <div className="space-y-4">
              {diagnostics?.setupInstructions?.map((step: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-white/90 text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="text-white font-medium mb-3">Required APIs to Enable</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {diagnostics?.requiredApis?.map((api: string) => (
                <div key={api} className="flex items-center space-x-2 text-sm text-white/80">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>{api}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-4">
            <h4 className="text-amber-200 font-medium mb-2">Quick Links</h4>
            <div className="space-y-2">
              <a 
                href="https://console.cloud.google.com/apis/library" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-amber-200 hover:text-amber-100 transition-colors text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Google Cloud Console - API Library</span>
              </a>
              <a 
                href="https://console.cloud.google.com/apis/credentials" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-amber-200 hover:text-amber-100 transition-colors text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Google Cloud Console - Credentials</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* API Testing Tab */}
      {activeTab === 'testing' && (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">Current API Key</h4>
              <button
                onClick={copyApiKey}
                className="flex items-center space-x-1 bg-blue-500/20 hover:bg-blue-500/30 px-3 py-1 rounded-lg transition-colors text-blue-200 text-sm"
              >
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </button>
            </div>
            <div className="bg-black/20 rounded-lg p-3 font-mono text-sm text-white/80 break-all">
              {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'Not configured'}
            </div>
          </div>

          <button
            onClick={runDiagnostics}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl transition-colors font-medium"
          >
            Run Diagnostics Again
          </button>

          {diagnostics?.lastError && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
              <h4 className="text-red-200 font-medium mb-2">Last Error Details</h4>
              <pre className="text-red-200/90 text-xs overflow-auto">
                {JSON.stringify(diagnostics.lastError, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}