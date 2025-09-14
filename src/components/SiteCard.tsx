import React from 'react';
import { MapPin, Key, CreditCard, Shield, AlertTriangle, Edit, Trash2, Navigation } from 'lucide-react';
import { Site } from '../types';
import { maskSensitiveData } from '../utils/crypto';

interface SiteCardProps {
  site: Site;
  showSensitiveData: boolean;
  onEdit: (site: Site) => void;
  onDelete: (siteId: string) => void;
}

export const SiteCard: React.FC<SiteCardProps> = ({
  site,
  showSensitiveData,
  onEdit,
  onDelete,
}) => {
  const getAccessIcon = (type: string) => {
    switch (type) {
      case 'key':
        return <Key className="h-4 w-4" />;
      case 'digicode':
        return <Shield className="h-4 w-4" />;
      case 'badge':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Key className="h-4 w-4" />;
    }
  };

  const getAccessLabel = (type: string) => {
    switch (type) {
      case 'key':
        return 'Clé';
      case 'digicode':
        return 'Digicode';
      case 'badge':
        return 'Badge';
      default:
        return 'Accès';
    }
  };

  const openInWaze = () => {
    let wazeUrl: string;
    
    if (site.latitude && site.longitude) {
      // Utiliser les coordonnées précises si disponibles
      wazeUrl = `https://waze.com/ul?ll=${site.latitude},${site.longitude}&navigate=yes`;
    } else {
      // Fallback: recherche par adresse textuelle
      wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(site.address)}&navigate=yes`;
    }
    
    window.open(wazeUrl, '_blank');
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-blue-500 transition-colors site-card">
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-3 sm:space-y-0">
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">{site.name}</h3>
            <div className="space-y-2">
              <div className="flex items-start space-x-2 text-gray-400">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm flex-1">{site.address}</span>
              </div>
              <div className="flex items-center justify-between">
                {site.latitude && site.longitude && (
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded" title="Coordonnées précises disponibles">
                    GPS
                  </span>
                )}
                <button
                  onClick={openInWaze}
                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  title={site.latitude && site.longitude ? "Ouvrir dans Waze (coordonnées précises)" : "Ouvrir dans Waze (recherche par adresse)"}
                >
                  <Navigation className="h-3 w-3" />
                  <span>Waze</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-1 sm:space-x-2 sm:ml-4">
            <button
              onClick={() => onEdit(site)}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Modifier"
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <button
              onClick={() => onDelete(site.id)}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Supprimer"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>

        {site.notes && (
          <p className="text-gray-300 text-sm mb-4 bg-gray-700 p-3 rounded-lg">
            {site.notes}
          </p>
        )}

        <div className="space-y-3">
          {site.accessMeans.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Moyens d'accès</h4>
              <div className="space-y-2">
                {site.accessMeans.map((access) => (
                  <div key={access.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-400">
                        {getAccessIcon(access.type)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {getAccessLabel(access.type)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {access.description}
                        </div>
                        {access.location && (
                          <div className="text-xs text-gray-500">
                            Emplacement: {access.location}
                          </div>
                        )}
                      </div>
                    </div>
                    {access.code && (
                      <div className="text-sm font-mono text-gray-300">
                        {showSensitiveData ? access.code : maskSensitiveData(access.code)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {site.hasAlarm && (
            <div className="bg-orange-900 bg-opacity-30 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-medium text-orange-200">
                    Alarme présente
                  </span>
                </div>
                {site.alarmCode && (
                  <div className="text-sm font-mono text-orange-200">
                    Code: {showSensitiveData ? site.alarmCode : maskSensitiveData(site.alarmCode)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-500">
          Ajouté le {new Date(site.createdAt).toLocaleDateString('fr-FR')}
        </div>
      </div>
    </div>
  );
};