import React from 'react';
import { RoundData } from '../types';
import { Bug, Eye, EyeOff } from 'lucide-react';

interface RoundDebuggerProps {
  round: RoundData;
  onClose: () => void;
}

export const RoundDebugger: React.FC<RoundDebuggerProps> = ({ round, onClose }) => {
  const [showRawData, setShowRawData] = React.useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bug className="h-5 w-5 text-yellow-400" />
            <h2 className="text-lg font-bold text-white">Debug Ronde</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowRawData(!showRawData)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title={showRawData ? "Masquer les données brutes" : "Afficher les données brutes"}
            >
              {showRawData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Round Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Informations de la ronde</h3>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400">Nom:</span>
                  <span className="text-white ml-2">{round.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">Site:</span>
                  <span className="text-white ml-2">{round.siteName}</span>
                </div>
                <div>
                  <span className="text-gray-400">Total des pas:</span>
                  <span className="text-white ml-2">{round.totalSteps}</span>
                </div>
                <div>
                  <span className="text-gray-400">Nombre d'étapes:</span>
                  <span className="text-white ml-2">{round.steps.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Date de création:</span>
                  <span className="text-white ml-2">{new Date(round.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400">Durée:</span>
                  <span className="text-white ml-2">{round.duration || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Steps Analysis */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Analyse des étapes</h3>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="space-y-4">
                {round.steps.map((step, index) => (
                  <div key={step.id} className="border border-gray-600 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                          {index + 1}
                        </span>
                        <span className="text-white font-medium">{step.action}</span>
                        {step.direction && (
                          <span className="text-gray-400">- {step.direction}</span>
                        )}
                      </div>
                      <span className="text-gray-400 text-sm">
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Pas:</span>
                        <span className="text-white ml-1">{step.steps || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Localisation:</span>
                        <span className="text-white ml-1">{step.location || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Notes:</span>
                        <span className="text-white ml-1">{step.notes || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">ID:</span>
                        <span className="text-white ml-1 text-xs">{step.id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Raw Data */}
          {showRawData && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Données brutes (JSON)</h3>
              <div className="bg-gray-800 p-4 rounded-lg">
                <pre className="text-xs text-gray-300 overflow-x-auto">
                  {JSON.stringify(round, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Statistiques</h3>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {round.steps.filter(s => s.action === 'Marche' || s.action === 'Tout droit').length}
                  </div>
                  <div className="text-sm text-gray-400">Marche</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {round.steps.filter(s => s.action === 'Droite').length}
                  </div>
                  <div className="text-sm text-gray-400">Droite</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {round.steps.filter(s => s.action === 'Gauche').length}
                  </div>
                  <div className="text-sm text-gray-400">Gauche</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {round.steps.filter(s => s.action === 'Pointeaux').length}
                  </div>
                  <div className="text-sm text-gray-400">Pointeaux</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
