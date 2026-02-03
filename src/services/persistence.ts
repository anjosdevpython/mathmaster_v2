
import { GameStats } from '../types';

const STORAGE_KEY = 'mathmaster_save_data';

export interface GameSaveData {
    version: number;
    unlockedLevel: number;
    highScores: Record<number, number>; // Level -> Best Score
    totalTimePlayed: number; // Em segundos
    settings: {
        soundEnabled: boolean;
        musicEnabled: boolean;
    };
    lastPlayed: string;
}

const DEFAULT_SAVE: GameSaveData = {
    version: 1,
    unlockedLevel: 1,
    highScores: {},
    totalTimePlayed: 0,
    settings: {
        soundEnabled: true,
        musicEnabled: true,
    },
    lastPlayed: new Date().toISOString(),
};

export const PersistenceService = {
    save(data: GameSaveData): void {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(STORAGE_KEY, serialized);
        } catch (e) {
            console.error('Failed to save game data:', e);
        }
    },

    load(): GameSaveData {
        try {
            const serialized = localStorage.getItem(STORAGE_KEY);
            if (!serialized) return DEFAULT_SAVE;

            const parsed = JSON.parse(serialized);
            // Merge with default to ensure new fields are present if added later
            return { ...DEFAULT_SAVE, ...parsed };
        } catch (e) {
            console.error('Failed to load game data:', e);
            return DEFAULT_SAVE;
        }
    },

    updateLevel(level: number): void {
        const data = this.load();
        if (level > data.unlockedLevel) {
            data.unlockedLevel = level;
            this.save(data);
        }
    },

    updateScore(level: number, score: number): void {
        const data = this.load();
        const currentBest = data.highScores[level] || 0;
        if (score > currentBest) {
            data.highScores[level] = score;
            this.save(data);
        }
    },

    exportData(): string {
        const data = this.load();
        return JSON.stringify(data, null, 2);
    },

    importData(json: string): boolean {
        try {
            const parsed = JSON.parse(json);
            // Basic validation
            if (typeof parsed !== 'object' || !parsed.version) {
                return false;
            }
            this.save({ ...DEFAULT_SAVE, ...parsed });
            return true;
        } catch (e) {
            console.error('Invalid import data', e);
            return false;
        }
    }
};
