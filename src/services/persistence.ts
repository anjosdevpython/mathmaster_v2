
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

import { supabase } from '../lib/supabase';

export const PersistenceService = {
    // Local methods
    saveLocal(data: GameSaveData): void {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(STORAGE_KEY, serialized);
        } catch (e) {
            console.error('Failed to save game data locally:', e);
        }
    },

    loadLocal(): GameSaveData {
        try {
            const serialized = localStorage.getItem(STORAGE_KEY);
            if (!serialized) return DEFAULT_SAVE;
            const parsed = JSON.parse(serialized);
            return { ...DEFAULT_SAVE, ...parsed };
        } catch (e) {
            console.error('Failed to load local game data:', e);
            return DEFAULT_SAVE;
        }
    },

    // Cloud methods
    async init(): Promise<void> {
        try {
            // Tenta logar anonimamente se não houver sessão
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                await supabase.auth.signInAnonymously();
            }
            // Sincroniza dados ao iniciar
            await this.sync();
        } catch (e) {
            console.warn('Cloud persistence initialization failed:', e);
        }
    },

    async sync(): Promise<void> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Busca dados da nuvem
            const { data: cloudEntry, error } = await supabase
                .from('game_progress')
                .select('data, updated_at')
                .eq('user_id', user.id)
                .single();

            const localData = this.loadLocal();

            if (cloudEntry && cloudEntry.data) {
                // Se nuvem existe, compara versões ou timestamps
                // Simplificação: Nuvem ganha se a versão for maior, senão local ganha
                const cloudData = cloudEntry.data as GameSaveData;

                if (cloudData.version > localData.version ||
                    (cloudData.version === localData.version && cloudData.unlockedLevel > localData.unlockedLevel)) {
                    console.log('Sync: Cloud data is newer, updating local.');
                    this.saveLocal(cloudData);
                    // Força reload da página se necessário, ou idealmente atualizaria o estado via callback
                    // Mas como este método roda no boot, o estado será carregado depois pelo App
                } else {
                    console.log('Sync: Local data is newer or equal, updating cloud.');
                    await this.saveCloud(localData);
                }
            } else if (!error) {
                // Primeira vez na nuvem
                await this.saveCloud(localData);
            }
        } catch (e) {
            console.error('Sync failed:', e);
        }
    },

    async saveCloud(data: GameSaveData): Promise<void> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase
                .from('game_progress')
                .upsert({
                    user_id: user.id,
                    data: data,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
        } catch (e) {
            console.error('Failed to save to cloud:', e);
        }
    },

    // Public API (Agora unificada)
    save(data: GameSaveData): void {
        this.saveLocal(data);
        // Salva na nuvem em background (sem await para não travar UI)
        this.saveCloud(data);
    },

    load(): GameSaveData {
        return this.loadLocal();
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
            if (typeof parsed !== 'object' || !parsed.version) {
                return false;
            }
            const newData = { ...DEFAULT_SAVE, ...parsed };
            this.save(newData); // Salva local e nuvem
            return true;
        } catch (e) {
            console.error('Invalid import data', e);
            return false;
        }
    }
};
