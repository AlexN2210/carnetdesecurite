import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Key, Shield, CreditCard, Navigation } from 'lucide-react';
import { Site, AccessMean } from '../types';
import { generateId } from '../utils/crypto';
import { AddressSearch } from './AddressSearch';

interface SiteFormProps {
  site?: Site;
  onSave: (site: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const SiteForm: React.FC<SiteFormProps> = ({
  site,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    notes: '',
    hasAlarm: false,
    alarmCode: '',
    accessMeans: [] as AccessMean[],
  });
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (site) {
      setFormData({
        name: site.name,
        address: site.address,
        notes: site.notes,
        hasAlarm: site.hasAlarm,
        alarmCode: site.alarmCode || '',
        accessMeans: [...site.accessMeans],
      });
      if (site.latitude && site.longitude) {
        setCoordinates({
          lat: site.latitude,
          lng: site.longitude
        });
      }
    }
  }, [site]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave({
      ...formData,
      latitude: coordinates?.lat,
      longitude: coordinates?.lng,
      alarmCode: formData.hasAlarm ? formData.alarmCode : undefined,
    });
  };

  const handleAddressSelect = (address: string, coords: { lat: number; lng: number }) => {
    setFormData(prev => ({ ...prev, address }));
    setCoordinates(coords);
  };

  const openInWaze = () => {
    if (coordinates) {
      const wazeUrl = `https://waze.com/ul?ll=${coordinates.lat},${coordinates.lng}&navigate=yes`;
      window.open(wazeUrl, '_blank');
    } else if (formData.address) {
      // Fallback: recherche par adresse textuelle
      const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(formData.address)}&navigate=yes`;
      window.open(wazeUrl, '_blank');
    }
  };

  const addAccessMean = () => {
    setFormData({
      ...formData,
      accessMeans: [
        ...formData.accessMeans,
        {
          id: generateId(),
          type: 'key',
          description: '',
          code: '',
          location: '',
        },
      ],
    });
  };

  const updateAccessMean = (index: number, updates: Partial<AccessMean>) => {
    const newAccessMeans = [...formData.accessMeans];
    newAccessMeans[index] = { ...newAccessMeans[index], ...updates };
    setFormData({ ...formData, accessMeans: newAccessMeans });
  };

  const removeAccessMean = (index: number) => {
    setFormData({
      ...formData,
      accessMeans: formData.accessMeans.filter((_, i) => i !== index),
    });
  };

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {site ? 'Modifier le site' : 'Nouveau site'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom du site *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Adresse
              </label>
              <div className="space-y-2">
                <AddressSearch
                  value={formData.address}
                  onChange={(address) => setFormData({ ...formData, address })}
                  onSelect={handleAddressSelect}
                  placeholder="Rechercher une adresse..."
                />
                {formData.address && (
                  <button
                    type="button"
                    onClick={openInWaze}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Navigation className="h-4 w-4" />
                    <span>Ouvrir dans Waze</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Moyens d'accès</h3>
              <button
                type="button"
                onClick={addAccessMean}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter</span>
              </button>
            </div>

            {formData.accessMeans.map((access, index) => (
              <div key={access.id} className="bg-gray-700 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-blue-400">
                    {getAccessIcon(access.type)}
                    <span className="font-medium">Accès #{index + 1}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAccessMean(index)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Type
                    </label>
                    <select
                      value={access.type}
                      onChange={(e) => updateAccessMean(index, { type: e.target.value as AccessMean['type'] })}
                      className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm border border-gray-500 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="key">Clé</option>
                      <option value="digicode">Digicode</option>
                      <option value="badge">Badge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={access.description}
                      onChange={(e) => updateAccessMean(index, { description: e.target.value })}
                      placeholder="Ex: Entrée principale"
                      className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm border border-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Emplacement
                    </label>
                    <input
                      type="text"
                      value={access.location || ''}
                      onChange={(e) => updateAccessMean(index, { location: e.target.value })}
                      placeholder="Ex: Boîte à clés"
                      className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm border border-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Code/Numéro (optionnel)
                  </label>
                  <input
                    type="text"
                    value={access.code || ''}
                    onChange={(e) => updateAccessMean(index, { code: e.target.value })}
                    placeholder="Code d'accès"
                    className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm border border-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="hasAlarm"
                checked={formData.hasAlarm}
                onChange={(e) => setFormData({ ...formData, hasAlarm: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="hasAlarm" className="text-sm font-medium text-gray-300">
                Alarme présente
              </label>
            </div>

            {formData.hasAlarm && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Code d'alarme
                </label>
                <input
                  type="text"
                  value={formData.alarmCode}
                  onChange={(e) => setFormData({ ...formData, alarmCode: e.target.value })}
                  placeholder="Code de désactivation"
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {site ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};