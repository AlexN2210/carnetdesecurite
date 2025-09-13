import React from 'react';
import { Shield, Lock, Unlock, Eye, EyeOff, Search } from 'lucide-react';

interface HeaderProps {
  isLocked: boolean;
  showSensitiveData: boolean;
  searchQuery: string;
  onLockToggle: () => void;
  onVisibilityToggle: () => void;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isLocked,
  showSensitiveData,
  searchQuery,
  onLockToggle,
  onVisibilityToggle,
  onSearchChange,
}) => {
  return (
    <header className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Carnet Sécurité</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher un site..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none w-64"
            />
          </div>
          
          <button
            onClick={onVisibilityToggle}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            title={showSensitiveData ? "Masquer les données" : "Afficher les données"}
          >
            {showSensitiveData ? (
              <EyeOff className="h-5 w-5 text-yellow-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
          
          <button
            onClick={onLockToggle}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            title={isLocked ? "Déverrouiller" : "Verrouiller"}
          >
            {isLocked ? (
              <Lock className="h-5 w-5 text-red-400" />
            ) : (
              <Unlock className="h-5 w-5 text-green-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};