import React, { useState, useEffect } from 'react';
import { Bug, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DebugInfo {
  supabaseConnected: boolean;
  userAuthenticated: boolean;
  localStorageAvailable: boolean;
  errors: string[];
  authState: string;
}

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    supabaseConnected: false,
    userAuthenticated: false,
    localStorageAvailable: false,
    errors: [],
    authState: 'unknown'
  });

  useEffect(() => {
    const checkDebugInfo = async () => {
      const info: DebugInfo = {
        supabaseConnected: false,
        userAuthenticated: false,
        localStorageAvailable: false,
        errors: [],
        authState: 'unknown'
      };

      // Vérifier localStorage
      try {
        localStorage.setItem('debug_test', 'test');
        localStorage.removeItem('debug_test');
        info.localStorageAvailable = true;
      } catch (error) {
        info.errors.push('localStorage non disponible');
      }

      // Vérifier Supabase
      try {
        const { supabase } = await import('../utils/supabase');
        const { data, error } = await supabase.auth.getUser();
        info.supabaseConnected = !error;
        info.userAuthenticated = !!data.user;
        info.authState = data.user ? 'authenticated' : 'not_authenticated';
        if (error) {
          info.errors.push(`Supabase error: ${error.message}`);
        }
      } catch (error) {
        info.errors.push(`Supabase connection failed: ${error}`);
      }

      setDebugInfo(info);
    };

    checkDebugInfo();
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg transition-colors"
        title="Panneau de débogage"
      >
        <Bug className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Bug className="h-5 w-5 mr-2" />
            Panneau de débogage
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">localStorage</span>
            {debugInfo.localStorageAvailable ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-400" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Supabase</span>
            {debugInfo.supabaseConnected ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-400" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Authentification</span>
            {debugInfo.userAuthenticated ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">État auth</span>
            <span className="text-sm text-gray-400">{debugInfo.authState}</span>
          </div>

          {debugInfo.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="text-red-400 font-medium mb-2">Erreurs détectées :</h4>
              <ul className="space-y-1">
                {debugInfo.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-300">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 flex space-x-2">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition-colors"
          >
            Recharger
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm transition-colors"
          >
            Reset complet
          </button>
        </div>
      </div>
    </div>
  );
};
