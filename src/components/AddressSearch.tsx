import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, ExternalLink, Navigation } from 'lucide-react';

interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
}

interface AddressSearchProps {
  value: string;
  onChange: (address: string) => void;
  onSelect: (address: string, coordinates: { lat: number; lng: number }) => void;
  placeholder?: string;
}

export const AddressSearch: React.FC<AddressSearchProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = "Rechercher une adresse..."
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<AddressResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce pour éviter trop de requêtes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length > 2) {
        searchAddress(query);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Fermer les résultats quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAddress = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1&countrycodes=fr`
      );
      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresse:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onChange(newQuery);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          selectAddress(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const selectAddress = (result: AddressResult) => {
    const address = result.display_name;
    const coordinates = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };
    
    setQuery(address);
    onChange(address);
    onSelect(address, coordinates);
    setShowResults(false);
    setSelectedIndex(-1);
  };

  const openInWaze = (result: AddressResult) => {
    const lat = result.lat;
    const lng = result.lon;
    const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    window.open(wazeUrl, '_blank');
  };

  const formatAddress = (result: AddressResult) => {
    const addr = result.address;
    if (!addr) return result.display_name;
    
    const parts = [];
    if (addr.house_number) parts.push(addr.house_number);
    if (addr.road) parts.push(addr.road);
    if (addr.city) parts.push(addr.city);
    if (addr.postcode) parts.push(addr.postcode);
    
    return parts.join(' ') || result.display_name;
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowResults(results.length > 0)}
          placeholder={placeholder}
          className="w-full bg-gray-700 text-white pl-10 pr-10 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={`${result.lat}-${result.lon}`}
              className={`px-4 py-3 cursor-pointer border-b border-gray-600 last:border-b-0 hover:bg-gray-600 ${
                index === selectedIndex ? 'bg-gray-600' : ''
              }`}
              onClick={() => selectAddress(result)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <MapPin className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {formatAddress(result)}
                    </p>
                    <p className="text-gray-400 text-xs truncate">
                      {result.display_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openInWaze(result);
                  }}
                  className="ml-2 p-1 text-gray-400 hover:text-blue-400 transition-colors flex-shrink-0"
                  title="Ouvrir dans Waze"
                >
                  <Navigation className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !isLoading && query.length > 2 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg p-4">
          <p className="text-gray-400 text-sm text-center">
            Aucune adresse trouvée
          </p>
        </div>
      )}
    </div>
  );
};
