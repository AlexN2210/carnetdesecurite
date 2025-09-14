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
  rounds: RoundData[];
  selectedSite: Site | null;
}

export interface RoundData {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  steps: RoundStep[];
  totalSteps: number;
  duration?: number;
  userId?: string;
  siteId?: string;
  siteName?: string;
  notes?: string;
  isCompleted: boolean;
}

export interface RoundStep {
  id: string;
  timestamp: number;
  action: string;
  direction?: string;
  steps: number;
  location?: string;
  notes?: string;
}