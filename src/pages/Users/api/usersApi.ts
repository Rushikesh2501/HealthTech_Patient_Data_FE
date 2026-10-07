import apiClient from '../../../services/api';
import { User, UserFormData } from '../../../types/user';
import { MOCK_USERS } from '../../../services/mockData';

const LOCAL_STORAGE_USERS_KEY = 'pm_user_directory_data';
const LOCAL_METADATA_KEY = 'pm_users_extended_meta';

interface UserMeta {
  phoneNumber?: string;
  designation?: string;
}

const getMetaMap = (): Record<string, UserMeta> => {
  try {
    const raw = localStorage.getItem(LOCAL_METADATA_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read metadata map', e);
  }
  return {
    '0': { phoneNumber: '+91 98201 12345', designation: 'Root Security Administrator' },
    '1': { phoneNumber: '+91 98202 54321', designation: 'Chief Medical Administrator' },
    '2': { phoneNumber: '+91 98203 67890', designation: 'Telemedicine Specialist' },
    '3': { phoneNumber: '+91 98204 98765', designation: 'Community Health Nurse' },
  };
};

const saveMetaMap = (map: Record<string, UserMeta>): void => {
  try {
    localStorage.setItem(LOCAL_METADATA_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save metadata map', e);
  }
};

const getLocalUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read local users:', e);
  }
  // Initialize with MOCK_USERS
  localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(MOCK_USERS));
  return [...MOCK_USERS];
};

const saveLocalUsers = (users: User[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save local users:', e);
  }
};

export const usersApi = {
  /**
   * Retrieve all users
   */
  async getUsers(): Promise<User[]> {
    const metaMap = getMetaMap();
    try {
      const res = await apiClient.get<any>('/users');
      const items = Array.isArray(res.data)
        ? res.data
        : res.data && Array.isArray(res.data.data)
        ? res.data.data
        : null;

      if (items && items.length > 0) {
        const mappedUsers: User[] = items.map((u: any) => {
          const idStr = String(u.id);
          const meta = metaMap[idStr] || {};
          return {
            ...u,
            id: idStr,
            phoneNumber:
              meta.phoneNumber ||
              u.phoneNumber ||
              (idStr === '1'
                ? '+91 98202 54321'
                : idStr === '2'
                ? '+91 98203 67890'
                : idStr === '3'
                ? '+91 98204 98765'
                : '+91 98111 22334'),
            designation:
              meta.designation ||
              u.designation ||
              (u.role === 'admin'
                ? 'Chief Medical Administrator'
                : u.role === 'clinician'
                ? 'Attending Clinician'
                : 'Community Health Nurse'),
          };
        });

        // Sync to local storage
        saveLocalUsers(mappedUsers);
        return mappedUsers;
      }
    } catch {
      // Backend /users endpoint might not exist yet; fall through to local store
    }

    const locals = getLocalUsers();
    return locals.map((u) => {
      const meta = metaMap[String(u.id)] || {};
      return {
        ...u,
        phoneNumber: meta.phoneNumber || u.phoneNumber,
        designation: meta.designation || u.designation,
      };
    });
  },

  /**
   * Register a new user
   */
  async createUser(data: UserFormData): Promise<User> {
    const metaMap = getMetaMap();
    let backendUser: any = null;

    try {
      const res = await apiClient.post<any>('/users', {
        name: data.name,
        email: data.email,
        role: data.role,
        password: data.password || 'Password@123',
      });
      if (res.data) {
        backendUser = res.data;
      }
    } catch (err) {
      console.warn('Backend create user failed, creating locally:', err);
    }

    const newId = backendUser ? String(backendUser.id) : Date.now().toString();

    metaMap[newId] = {
      phoneNumber: data.phoneNumber,
      designation: data.designation,
    };
    saveMetaMap(metaMap);

    const newUser: User = {
      ...(backendUser || {}),
      id: newId,
      name: data.name,
      email: data.email,
      role: data.role,
      phoneNumber: data.phoneNumber || '',
      designation:
        data.designation ||
        (data.role === 'admin'
          ? 'System Administrator'
          : data.role === 'clinician'
          ? 'Attending Clinician'
          : data.role === 'nurse'
          ? 'Registered Nurse'
          : 'Root Operator'),
    };

    const currentUsers = getLocalUsers();
    saveLocalUsers([newUser, ...currentUsers.filter((u) => String(u.id) !== newId)]);
    return newUser;
  },

  /**
   * Update existing user
   */
  async updateUser(id: string | number, data: Partial<UserFormData>): Promise<User> {
    const idStr = String(id);
    const metaMap = getMetaMap();

    if (data.phoneNumber !== undefined || data.designation !== undefined) {
      metaMap[idStr] = {
        phoneNumber: data.phoneNumber ?? metaMap[idStr]?.phoneNumber,
        designation: data.designation ?? metaMap[idStr]?.designation,
      };
      saveMetaMap(metaMap);
    }

    let backendUser: any = null;
    try {
      // Backend schema UserUpdate only accepts { name, role, is_active, password }
      const patchPayload: Record<string, any> = {};
      if (data.name) patchPayload.name = data.name;
      if (data.role) patchPayload.role = data.role;

      if (Object.keys(patchPayload).length > 0) {
        const res = await apiClient.patch<any>(`/users/${id}`, patchPayload);
        backendUser = res.data;
      }
    } catch (err) {
      console.warn('Backend patch user failed, persisting locally:', err);
    }

    const currentUsers = getLocalUsers();
    const existingIndex = currentUsers.findIndex((u) => String(u.id) === idStr);

    let updated: User;
    if (backendUser) {
      updated = {
        ...backendUser,
        id: idStr,
        name: data.name || backendUser.name,
        role: data.role || backendUser.role,
        phoneNumber: data.phoneNumber || metaMap[idStr]?.phoneNumber,
        designation: data.designation || metaMap[idStr]?.designation,
      };
    } else if (existingIndex >= 0) {
      updated = {
        ...currentUsers[existingIndex],
        ...data,
        id: idStr,
      };
    } else {
      updated = {
        id: idStr,
        name: data.name || 'User',
        email: data.email || 'user@healthtech.gov.in',
        role: data.role || 'clinician',
        phoneNumber: data.phoneNumber || '',
        designation: data.designation || 'Staff Member',
      };
    }

    if (existingIndex >= 0) {
      currentUsers[existingIndex] = updated;
    } else {
      currentUsers.unshift(updated);
    }
    saveLocalUsers(currentUsers);

    return updated;
  },

  /**
   * Delete user
   */
  async deleteUser(id: string | number): Promise<boolean> {
    const idStr = String(id);
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (err) {
      console.warn('Backend delete user failed, removing locally:', err);
    }

    const currentUsers = getLocalUsers();
    saveLocalUsers(currentUsers.filter((u) => String(u.id) !== idStr));

    const metaMap = getMetaMap();
    delete metaMap[idStr];
    saveMetaMap(metaMap);

    return true;
  },
};
