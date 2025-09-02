import { atom } from 'nanostores';

interface Profile {
  name: string;
  theme: string;
  avatar: string;
  username?: string;
  bio?: string;
}

// Initialize with defaults
const initialProfile: Profile = {
  name: '',
  theme: 'light',
  avatar: '',
};

export const profileStore = atom<Profile>(initialProfile);

// Load profile from localStorage on client side
if (typeof window !== 'undefined') {
  const storedProfile = localStorage.getItem('bolt_profile');

  if (storedProfile) {
    try {
      profileStore.set(JSON.parse(storedProfile));
    } catch (error) {
      console.error('Failed to parse profile from localStorage:', error);
    }
  }
}

export const updateProfile = (updates: Partial<Profile>) => {
  profileStore.set({ ...profileStore.get(), ...updates });

  // Persist to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('bolt_profile', JSON.stringify(profileStore.get()));
  }
};
