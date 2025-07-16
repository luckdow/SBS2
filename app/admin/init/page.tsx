'use client';

import { useState, useEffect } from 'react';
import { initializeDatabase, getDatabaseStatus, validateDatabaseStructure } from '../../../lib/services/database';
import { testFirebaseConnection, isFirebaseConfigured } from '../../../lib/firebase';
import { testGoogleMapsConnection, isGoogleMapsConfigured } from '../../../lib/services/googleMaps';

export default function SystemInitPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const checkSystemStatus = async () => {
    setLoading(true);
    setLogs([]);
    
    try {
      addLog('Checking system status...');
      
      // Check Firebase configuration
      const firebaseConfigured = isFirebaseConfigured();
      addLog(`Firebase configuration: ${firebaseConfigured ? 'OK' : 'MISSING'}`);
      
      // Check Google Maps configuration
      const mapsConfigured = isGoogleMapsConfigured();
      addLog(`Google Maps configuration: ${mapsConfigured ? 'OK' : 'MISSING'}`);
      
      if (firebaseConfigured) {
        // Test Firebase connection
        const firebaseConnected = await testFirebaseConnection();
        addLog(`Firebase connection: ${firebaseConnected ? 'OK' : 'FAILED'}`);
        
        if (firebaseConnected) {
          // Get database status
          const dbStatus = await getDatabaseStatus();
          addLog(`Database status retrieved`);
          
          // Validate database structure
          const validation = await validateDatabaseStructure();
          addLog(`Database validation: ${validation.isValid ? 'VALID' : 'INCOMPLETE'}`);
          
          setStatus({
            firebase: { configured: firebaseConfigured, connected: firebaseConnected },
            maps: { configured: mapsConfigured },
            database: { status: dbStatus, validation }
          });
        }
      }
      
      addLog('Status check completed');
    } catch (error) {
      addLog(`Error: ${error}`);
      console.error('Status check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeSystem = async () => {
    setLoading(true);
    setLogs([]);
    
    try {
      addLog('Starting system initialization...');
      
      // Test Firebase connection first
      const firebaseConnected = await testFirebaseConnection();
      if (!firebaseConnected) {
        throw new Error('Firebase connection failed');
      }
      addLog('Firebase connection verified');
      
      // Initialize database
      const result = await initializeDatabase();
      addLog('Database initialization completed');
      
      if (result.success) {
        addLog('✅ System initialization successful!');
        
        // Refresh status
        await checkSystemStatus();
      } else {
        addLog('❌ System initialization failed');
      }
      
    } catch (error) {
      addLog(`❌ Initialization error: ${error}`);
      console.error('Initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystemStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            SBS Travel Platform - System Initialization
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Panel */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">System Status</h2>
              
              {status && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Firebase Configuration:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      status.firebase?.configured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {status.firebase?.configured ? 'OK' : 'MISSING'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Firebase Connection:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      status.firebase?.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {status.firebase?.connected ? 'OK' : 'FAILED'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Google Maps Configuration:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      status.maps?.configured ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {status.maps?.configured ? 'OK' : 'PLACEHOLDER'}
                    </span>
                  </div>
                  
                  {status.database && (
                    <div className="flex items-center justify-between">
                      <span>Database Structure:</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        status.database.validation?.isValid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {status.database.validation?.isValid ? 'COMPLETE' : 'INCOMPLETE'}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-4 space-x-2">
                <button
                  onClick={checkSystemStatus}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Checking...' : 'Refresh Status'}
                </button>
                
                <button
                  onClick={initializeSystem}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Initializing...' : 'Initialize Database'}
                </button>
              </div>
            </div>
            
            {/* Logs Panel */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">System Logs</h2>
              
              <div className="bg-black text-green-400 rounded p-3 h-64 overflow-y-auto font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-gray-500">No logs yet...</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Database Collections Status */}
          {status?.database?.status && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Database Collections</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(status.database.status.collections).map(([collection, exists]) => (
                  <div key={collection} className="flex items-center justify-between p-2 bg-white rounded">
                    <span className="text-sm">{collection}</span>
                    <span className={`w-3 h-3 rounded-full ${
                      exists ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Configuration Guide */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">Configuration Guide</h2>
            
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                <strong>Firebase:</strong> Already configured with production values in .env.local
              </p>
              <p>
                <strong>Google Maps:</strong> Update NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local with your API key
              </p>
              <p>
                <strong>PayTR:</strong> Update PayTR configuration in .env.local when ready for payment integration
              </p>
              <p>
                <strong>Database:</strong> Click "Initialize Database" to create all required collections
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}