import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

const WEB_KEY = 'escolarai_biometrics';
const NATIVE_FILE = (FileSystem.documentDirectory ?? '') + 'biometrics.json';

export type BiometricEntry = {
  studentId: string;
  studentName: string;
  code: string;
  enrolledAt: string;
};

type BiometricsData = {
  biometrics: BiometricEntry[];
};

async function load(): Promise<BiometricsData> {
  try {
    if (Platform.OS === 'web') {
      const raw = localStorage.getItem(WEB_KEY);
      return raw ? (JSON.parse(raw) as BiometricsData) : { biometrics: [] };
    }
    const info = await FileSystem.getInfoAsync(NATIVE_FILE);
    if (!info.exists) return { biometrics: [] };
    const content = await FileSystem.readAsStringAsync(NATIVE_FILE);
    return JSON.parse(content) as BiometricsData;
  } catch {
    return { biometrics: [] };
  }
}

async function persist(data: BiometricsData): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(WEB_KEY, JSON.stringify(data));
    return;
  }
  await FileSystem.writeAsStringAsync(NATIVE_FILE, JSON.stringify(data, null, 2));
}

export async function getBiometric(studentId: string): Promise<BiometricEntry | null> {
  const data = await load();
  return data.biometrics.find((b) => b.studentId === studentId) ?? null;
}

export async function saveBiometric(entry: BiometricEntry): Promise<void> {
  const data = await load();
  const idx = data.biometrics.findIndex((b) => b.studentId === entry.studentId);
  if (idx >= 0) {
    data.biometrics[idx] = entry;
  } else {
    data.biometrics.push(entry);
  }
  await persist(data);
}

export async function removeBiometric(studentId: string): Promise<void> {
  const data = await load();
  data.biometrics = data.biometrics.filter((b) => b.studentId !== studentId);
  await persist(data);
}
