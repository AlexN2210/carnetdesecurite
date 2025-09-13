import React, { useState } from 'react';
import { Lock, AlertTriangle } from 'lucide-react';

interface PasswordModalProps {
  isSetup: boolean;
  onSubmit: (password: string, confirmPassword?: string) => Promise<boolean>;
  onCancel?: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isSetup,
  onSubmit,
  onCancel,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSetup) {
      if (password.length < 4) {
        setError('Le mot de passe doit contenir au moins 4 caractères');
        return;
      }
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
    }

    const success = await onSubmit(password, confirmPassword);
    if (!success && !isSetup) {
      setError('Mot de passe incorrect');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center space-x-3 mb-6">
          <Lock className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">
            {isSetup ? 'Définir un mot de passe maître' : 'Déverrouiller l\'application'}
          </h2>
        </div>

        {isSetup && (
          <div className="flex items-start space-x-2 mb-4 p-3 bg-yellow-900 bg-opacity-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="text-sm text-yellow-200">
              Ce mot de passe protégera l'accès à vos données sensibles. 
              Assurez-vous de le mémoriser car il ne pourra pas être récupéré.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              autoFocus
            />
          </div>

          {isSetup && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {isSetup ? 'Créer' : 'Déverrouiller'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};