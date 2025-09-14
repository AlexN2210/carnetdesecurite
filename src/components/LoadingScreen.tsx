import React from 'react';

interface LoadingScreenProps {
  message?: string;
  onEmergencyUnlock?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Chargement de votre carnet de sécurité..." 
}) => {
  return (
    <div className="h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-amber-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-green-500 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Logo container */}
        <div className="relative mb-8">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-blue-400/20 to-green-400/20 rounded-full blur-2xl scale-150 animate-pulse"></div>
          
          {/* Logo */}
          <div className="relative w-32 h-32 mx-auto">
            <svg 
              width="128" 
              height="128" 
              viewBox="0 0 512 512" 
              className="w-full h-full animate-spin-slow"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:"#1f2937", stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:"#374151", stopOpacity:1}} />
                </linearGradient>
                <linearGradient id="lock" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:"#f59e0b", stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:"#d97706", stopOpacity:1}} />
                </linearGradient>
                <linearGradient id="eye" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:"#3b82f6", stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:"#1d4ed8", stopOpacity:1}} />
                </linearGradient>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" style={{stopColor:"#ffffff", stopOpacity:0.2}} />
                  <stop offset="100%" style={{stopColor:"#ffffff", stopOpacity:0}} />
                </radialGradient>
              </defs>
              
              {/* Background circle */}
              <circle cx="256" cy="256" r="240" fill="url(#bg)" stroke="#4b5563" strokeWidth="6"/>
              
              {/* Glow effect */}
              <circle cx="256" cy="256" r="200" fill="url(#glow)"/>
              
              {/* Main lock body */}
              <rect x="200" y="180" width="112" height="80" rx="8" fill="url(#lock)" stroke="#92400e" strokeWidth="3"/>
              
              {/* Lock shackle */}
              <path d="M220 180 Q220 140 256 140 Q292 140 292 180" 
                    stroke="url(#lock)" strokeWidth="12" strokeLinecap="round" fill="none"/>
              
              {/* Lock keyhole */}
              <circle cx="256" cy="220" r="8" fill="#1f2937"/>
              <rect x="252" y="220" width="8" height="16" fill="#1f2937"/>
              
              {/* Surveillance eye */}
              <circle cx="256" cy="320" r="24" fill="url(#eye)" stroke="#1e40af" strokeWidth="4"/>
              <circle cx="256" cy="320" r="16" fill="#ffffff"/>
              <circle cx="256" cy="320" r="8" fill="#1f2937"/>
              
              {/* Security shield overlay */}
              <path d="M256 120 L200 160 L200 240 C200 280 220 320 256 340 C292 320 312 280 312 240 L312 160 Z" 
                    fill="none" stroke="#10b981" strokeWidth="4" opacity="0.6"/>
              
              {/* Security dots pattern */}
              <circle cx="180" y="180" r="4" fill="#6b7280" opacity="0.7"/>
              <circle cx="332" y="180" r="4" fill="#6b7280" opacity="0.7"/>
              <circle cx="180" y="280" r="4" fill="#6b7280" opacity="0.7"/>
              <circle cx="332" y="280" r="4" fill="#6b7280" opacity="0.7"/>
              
              {/* Privacy lines */}
              <line x1="160" y1="200" x2="180" y2="200" stroke="#6b7280" strokeWidth="2" opacity="0.5"/>
              <line x1="160" y1="220" x2="180" y2="220" stroke="#6b7280" strokeWidth="2" opacity="0.5"/>
              <line x1="160" y1="240" x2="180" y2="240" stroke="#6b7280" strokeWidth="2" opacity="0.5"/>
              
              <line x1="332" y1="200" x2="352" y2="200" stroke="#6b7280" strokeWidth="2" opacity="0.5"/>
              <line x1="332" y1="220" x2="352" y2="220" stroke="#6b7280" strokeWidth="2" opacity="0.5"/>
              <line x1="332" y1="240" x2="352" y2="240" stroke="#6b7280" strokeWidth="2" opacity="0.5"/>
              
              {/* Security checkmark */}
              <path d="M240 300 L260 320 L280 300" 
                    stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
        </div>

        {/* App title */}
        <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in">
          Carnet de Sécurité
        </h1>
        
        {/* Subtitle */}
        <p className="text-gray-400 text-lg mb-8 animate-fade-in-delay">
          Surveillance privée et sécurisée
        </p>

        {/* Loading message */}
        <div className="mb-8">
          <p className="text-gray-300 text-sm mb-4 animate-fade-in-delay-2">
            {message}
          </p>
          
          {/* Loading dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-1 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 via-blue-400 to-green-400 rounded-full animate-progress"></div>
        </div>

        {/* Security features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center animate-fade-in-delay-3">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs text-gray-400">Sécurisé</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs text-gray-400">Surveillance</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs text-gray-400">Protégé</span>
          </div>
        </div>
      </div>
    </div>
  );
};
