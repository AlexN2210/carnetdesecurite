import React from 'react';
import { Shield, Lock, Unlock, Eye, EyeOff, Search, LogOut, User } from 'lucide-react';

interface HeaderProps {
  isLocked: boolean;
  showSensitiveData: boolean;
  searchQuery: string;
  onLockToggle: () => void;
  onVisibilityToggle: () => void;
  onSearchChange: (query: string) => void;
  user?: any;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isLocked,
  showSensitiveData,
  searchQuery,
  onLockToggle,
  onVisibilityToggle,
  onSearchChange,
  user,
  onLogout,
}) => {
  return (
    <header className="bg-gray-900 border-b border-gray-700 px-4 py-4">
      <div className="max-w-7xl mx-auto">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between">
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
            
            {user && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg">
                <User className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">{user.email}</span>
              </div>
            )}
            
            <button
              onClick={onLogout}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="h-5 w-5 text-red-400" />
            </button>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-blue-400" />
              <h1 className="text-xl font-bold text-white">Carnet Sécurité</h1>
            </div>
            
            <div className="flex items-center space-x-2">
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
                onClick={onLogout}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                title="Se déconnecter"
              >
                <LogOut className="h-5 w-5 text-red-400" />
              </button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher un site..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          {user && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg">
              <User className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-300 truncate">{user.email}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};