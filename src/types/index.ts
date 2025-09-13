export interface Site {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  notes: string;
  accessMeans: AccessMean[];
  hasAlarm: boolean;
  alarmCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccessMean {
  id: string;
  type: 'key' | 'digicode' | 'badge';
  description: string;
  code?: string;
  location?: string;
}

export interface AppState {
  sites: Site[];
  isLocked: boolean;
  searchQuery: string;
  showSensitiveData: boolean;
}