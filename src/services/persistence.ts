
import { GameStats } from '../types';

const STORAGE_KEY = 'vektramind_save_data';
const OLD_STORAGE_KEY = 'mathmaster_save_data';

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
            console.error('VektraMind: Failed to save game data locally:', e);
        }
    },

    loadLocal(): GameSaveData {
        try {
            let serialized = localStorage.getItem(STORAGE_KEY);

            // Migração: Se não tem dados Vektra, tenta pegar os antigos MathMaster
            if (!serialized) {
                const oldData = localStorage.getItem(OLD_STORAGE_KEY);
                if (oldData) {
                    console.log('VektraMind: Migrando dados do MathMaster...');
                    serialized = oldData;
                    // Salva com a nova chave para completar migração
                    localStorage.setItem(STORAGE_KEY, oldData);
                }
            }

            if (!serialized) return DEFAULT_SAVE;
            const parsed = JSON.parse(serialized);
            return { ...DEFAULT_SAVE, ...parsed };
        } catch (e) {
            console.error('VektraMind: Failed to load local game data:', e);
            return DEFAULT_SAVE;
        }
    },

    // Cloud methods
    async init(): Promise<void> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                console.log('Persistence: Sessão detectada, sincronizando...');
                await this.sync();
            } else {
                console.log('Persistence: Modo local (sem usuário autenticado).');
            }
        } catch (e) {
            console.warn('Persistence initialization skipped (local mode only).');
        }
    },

    async sync(): Promise<void> {
        try {
            console.log('Sync: Iniciando sincronização...');
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.log('Sync: Nenhum usuário autenticado para sincronizar.');
                return;
            }

            // Adicionar um timeout manual de 5 segundos para a requisição
            const syncPromise = (async () => {
                const { data: cloudEntry, error } = await supabase
                    .from('game_progress')
                    .select('data, updated_at')
                    .eq('user_id', user.id)
                    .maybeSingle(); // maybeSingle é mais seguro que single() para 0 ou 1 resultado

                const localData = this.loadLocal();

                if (cloudEntry && cloudEntry.data) {
                    console.log('Sync: Dados encontrados na nuvem.');
                    const cloudData = cloudEntry.data as GameSaveData;

                    if (cloudData.version > localData.version ||
                        (cloudData.version === localData.version && cloudData.unlockedLevel > localData.unlockedLevel)) {
                        console.log('Sync: Dados da nuvem são mais recentes, atualizando local.');
                        this.saveLocal(cloudData);
                    } else if (JSON.stringify(cloudData) !== JSON.stringify(localData)) {
                        console.log('Sync: Dados locais são mais recentes ou diferentes, atualizando nuvem.');
                        await this.saveCloud(localData);
                    }
                } else {
                    // Se não há dados na nuvem (ou erro de não encontrado)
                    console.log('Sync: Primeira sincronização, enviando dados locais para nuvem.');
                    await this.saveCloud(localData);
                }
            })();

            // Timeout de 5s para evitar travamento infinito
            await Promise.race([
                syncPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout na sincronização')), 5000))
            ]);

        } catch (e) {
            console.error('Sync failed or timed out:', e);
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
