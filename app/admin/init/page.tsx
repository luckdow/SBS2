// Database initialization script for Module 1
'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { dataService } from '../../../lib/services/dataService';

export default function AdminInitPage() {
  const [initStatus, setInitStatus] = useState({
    connection: 'pending',
    collections: 'pending',
    sampleData: 'pending'
  });
  const [isInitializing, setIsInitializing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    try {
      addLog('Testing database connection...');
      const healthCheck = await dataService.healthCheck();
      addLog(`Connection successful - Mode: ${healthCheck.mode}`);
      setInitStatus(prev => ({ ...prev, connection: 'success' }));
      return true;
    } catch (error) {
      addLog(`Connection failed: ${error}`);
      setInitStatus(prev => ({ ...prev, connection: 'error' }));
      return false;
    }
  };

  const initializeCollections = async () => {
    try {
      addLog('Initializing database collections...');
      await dataService.initializeCollections();
      addLog('Collections initialized successfully');
      setInitStatus(prev => ({ ...prev, collections: 'success' }));
      return true;
    } catch (error) {
      addLog(`Collection initialization failed: ${error}`);
      setInitStatus(prev => ({ ...prev, collections: 'error' }));
      return false;
    }
  };

  const loadSampleData = async () => {
    try {
      addLog('Loading sample data...');
      
      // Test loading data from each collection
      const vehicles = await dataService.getCollection('vehicles');
      const drivers = await dataService.getCollection('drivers');
      const services = await dataService.getCollection('services');
      const customers = await dataService.getCollection('customers');
      
      addLog(`Loaded ${vehicles.length} vehicles`);
      addLog(`Loaded ${drivers.length} drivers`);
      addLog(`Loaded ${services.length} services`);
      addLog(`Loaded ${customers.length} customers`);
      
      setInitStatus(prev => ({ ...prev, sampleData: 'success' }));
      return true;
    } catch (error) {
      addLog(`Sample data loading failed: ${error}`);
      setInitStatus(prev => ({ ...prev, sampleData: 'error' }));
      return false;
    }
  };

  const runFullInitialization = async () => {
    setIsInitializing(true);
    setLogs([]);
    setInitStatus({
      connection: 'pending',
      collections: 'pending',
      sampleData: 'pending'
    });

    addLog('Starting Module 1 infrastructure initialization...');

    // Step 1: Test connection
    const connectionOk = await testConnection();
    if (!connectionOk) {
      setIsInitializing(false);
      toast.error('Database connection failed');
      return;
    }

    // Step 2: Initialize collections
    const collectionsOk = await initializeCollections();
    if (!collectionsOk) {
      setIsInitializing(false);
      toast.error('Collection initialization failed');
      return;
    }

    // Step 3: Load sample data
    const dataOk = await loadSampleData();
    if (!dataOk) {
      setIsInitializing(false);
      toast.error('Sample data loading failed');
      return;
    }

    addLog('✅ Module 1 infrastructure setup completed successfully!');
    setIsInitializing(false);
    toast.success('Database initialization completed!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <RefreshCw className="h-5 w-5 text-yellow-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-500/50 bg-green-500/10';
      case 'error':
        return 'border-red-500/50 bg-red-500/10';
      default:
        return 'border-yellow-500/50 bg-yellow-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-500/20 p-4 rounded-lg">
              <Database className="h-12 w-12 text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Module 1: Infrastructure Setup</h1>
          <p className="text-gray-300 text-lg">Initialize the SBS Transfer database and basic infrastructure</p>
        </motion.div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`border rounded-xl p-6 ${getStatusColor(initStatus.connection)}`}
          >
            <div className="flex items-center space-x-3 mb-3">
              {getStatusIcon(initStatus.connection)}
              <h3 className="text-lg font-semibold text-white">Database Connection</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Test connection to Firebase/Mock database
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`border rounded-xl p-6 ${getStatusColor(initStatus.collections)}`}
          >
            <div className="flex items-center space-x-3 mb-3">
              {getStatusIcon(initStatus.collections)}
              <h3 className="text-lg font-semibold text-white">Collections Setup</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Initialize all required database collections
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`border rounded-xl p-6 ${getStatusColor(initStatus.sampleData)}`}
          >
            <div className="flex items-center space-x-3 mb-3">
              {getStatusIcon(initStatus.sampleData)}
              <h3 className="text-lg font-semibold text-white">Sample Data</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Load initial sample data for testing
            </p>
          </motion.div>
        </div>

        {/* Initialize Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <button
            onClick={runFullInitialization}
            disabled={isInitializing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:scale-100 flex items-center space-x-3 mx-auto"
          >
            {isInitializing ? (
              <RefreshCw className="h-6 w-6 animate-spin" />
            ) : (
              <Database className="h-6 w-6" />
            )}
            <span>
              {isInitializing ? 'Initializing...' : 'Initialize Infrastructure'}
            </span>
          </button>
        </motion.div>

        {/* Logs */}
        {logs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-black/30 border border-white/20 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Initialization Logs</h3>
            <div className="bg-black/50 rounded-lg p-4 max-h-64 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-gray-300 text-sm font-mono mb-1">
                  {log}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}