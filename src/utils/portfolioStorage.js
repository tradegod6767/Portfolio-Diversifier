// Portfolio storage utilities — localStorage for free users, Supabase cloud for Pro users

import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'saved_portfolios';
const MAX_FREE_PORTFOLIOS = 5;

// --- localStorage helpers (free/anonymous users + offline fallback) ---

function getLocalPortfolios() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setLocalPortfolios(portfolios) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios));
}

// --- Supabase cloud helpers (Pro users) ---

async function getCloudPortfolios(userId) {
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    positions: row.positions,
    savedAt: row.updated_at,
    isLocal: false,
  }));
}

async function upsertCloudPortfolio(userId, name, positions) {
  const { data, error } = await supabase
    .from('portfolios')
    .upsert(
      {
        user_id: userId,
        name,
        positions,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,name' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteCloudPortfolio(userId, name) {
  const { error } = await supabase
    .from('portfolios')
    .delete()
    .eq('user_id', userId)
    .eq('name', name);

  if (error) throw error;
}

// --- Migration: move localStorage portfolios to cloud on first Pro load ---

let migrationPromise = null;

async function migrateLocalToCloud(userId) {
  if (migrationPromise) return migrationPromise;

  const local = getLocalPortfolios();
  if (local.length === 0) return;

  migrationPromise = (async () => {
    try {
      const results = await Promise.allSettled(
        local.map((p) => upsertCloudPortfolio(userId, p.name, p.positions))
      );

      const failed = results
        .map((r, i) => (r.status === 'rejected' ? local[i].name : null))
        .filter(Boolean);

      if (failed.length > 0) {
        console.error('[portfolioStorage] Migration failed for portfolios:', failed);
      }

      // Only clear localStorage when ALL portfolios uploaded successfully
      const allSucceeded = results.every((r) => r.status === 'fulfilled');
      if (allSucceeded) {
        localStorage.removeItem(STORAGE_KEY);
      }
    } finally {
      migrationPromise = null;
    }
  })();

  return migrationPromise;
}

// --- Public API ---

export const savePortfolio = async (name, positions, user = null, isPro = false) => {
  const cleanPositions = positions.map((p) => ({
    ticker: p.ticker,
    amount: p.amount,
    targetPercent: p.targetPercent,
    costBasis: p.costBasis || null,
    purchaseDate: p.purchaseDate || null,
  }));

  if (user && isPro) {
    if (!user.id) {
      throw new Error('Your session is not ready yet. Please wait a moment and try again.');
    }
    try {
      const data = await upsertCloudPortfolio(user.id, name, cleanPositions);
      if (!data || !data.id || data.name !== name || !Array.isArray(data.positions)) {
        throw new Error(
          'Save appeared to succeed but the returned record is incomplete. Please try again.'
        );
      }
      return { name, positions: cleanPositions, savedAt: new Date().toISOString(), isLocal: false };
    } catch (err) {
      console.error('[portfolioStorage] Cloud save failed:', err);
      throw err;
    }
  }

  // Free / anonymous — use localStorage
  const portfolios = getLocalPortfolios();
  const existingIndex = portfolios.findIndex((p) => p.name === name);

  const portfolio = {
    name,
    positions: cleanPositions,
    savedAt: new Date().toISOString(),
    isLocal: true,
  };

  if (existingIndex >= 0) {
    portfolios[existingIndex] = portfolio;
  } else {
    if (portfolios.length >= MAX_FREE_PORTFOLIOS) {
      throw new Error(
        `Maximum of ${MAX_FREE_PORTFOLIOS} portfolios can be saved. Upgrade to Pro for unlimited cloud storage.`
      );
    }
    portfolios.push(portfolio);
  }

  try {
    setLocalPortfolios(portfolios);
  } catch (err) {
    console.error('[portfolioStorage] Local save failed:', err);
    throw new Error('Failed to save portfolio locally. Your browser storage may be full.');
  }
  return portfolio;
};

export const getSavedPortfolios = async (user = null, isPro = false) => {
  if (user && isPro) {
    try {
      // Migrate any local portfolios to cloud on first load
      await migrateLocalToCloud(user.id);
      return await getCloudPortfolios(user.id);
    } catch (err) {
      // Fallback to local storage on cloud failure
      console.warn('[portfolioStorage] Cloud load failed, falling back to local:', err.message);
    }
  }

  // Free / anonymous / fallback
  return getLocalPortfolios().map((p) => ({ ...p, isLocal: true }));
};

export const deletePortfolio = async (name, user = null, isPro = false) => {
  if (user && isPro) {
    await deleteCloudPortfolio(user.id, name);
    return;
  }

  // Free / anonymous
  const portfolios = getLocalPortfolios();
  const filtered = portfolios.filter((p) => p.name !== name);
  setLocalPortfolios(filtered);
};

export const getPortfolio = async (name, user = null, isPro = false) => {
  if (user && isPro) {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .eq('name', name)
        .single();

      if (error) throw error;
      return {
        id: data.id,
        name: data.name,
        positions: data.positions,
        savedAt: data.updated_at,
        isLocal: false,
      };
    } catch (err) {
      console.warn(
        '[portfolioStorage] Cloud getPortfolio failed, falling back to local:',
        err.message
      );
    }
  }

  const portfolios = getLocalPortfolios();
  return portfolios.find((p) => p.name === name) || null;
};
