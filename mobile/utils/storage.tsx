// storage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

// Generates a random UUID-like string
export const uuid = (): string => Math.random().toString(36).slice(2, 9);

/**
 * Loads data from AsyncStorage for a given key.
 * If data is not found, it initializes storage with the sample data and returns it.
 * @param key The storage key.
 * @param sample The default/initial value to use if none is found.
 * @returns The loaded or initialized data.
 */
export async function loadOrInit<T>(key: string, sample: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    
    if (!raw) {
      await AsyncStorage.setItem(key, JSON.stringify(sample));
      return sample;
    }
    
    // Parse the stored string back into the expected type T
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn('Storage load error', e);
    // Return the sample on error as a fallback
    return sample;
  }
}

/**
 * Saves a value to AsyncStorage.
 * @param key The storage key.
 * @param value The value to save (will be JSON stringified).
 */
export async function save<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage save error', e);
  }
}