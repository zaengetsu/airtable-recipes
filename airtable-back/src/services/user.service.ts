import { AirtableError, AirtableUser } from '../types/airtable.types';
import { tables } from '../lib/airtable';

export const userService = {
  async getUserByEmail(email: string): Promise<AirtableUser | null> {
    try {
      const records = await tables.users
        .select({ filterByFormula: `{email} = '${email}'` })
        .firstPage();
      if (records.length === 0) {
        return null;
      }
      const record = records[0];
      return {
        id: record.id,
        username: record.get('username') as string,
        email: record.get('email') as string,
        password: record.get('password') as string,
        role: record.get('role') as 'user' | 'admin',
        allergies: JSON.parse(record.get('allergies') as string || '[]'),
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
      };
    } catch (error) {
      throw new AirtableError('Erreur lors de la récupération de l\'utilisateur');
    }
  },

  async createUser(user: Omit<AirtableUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<AirtableUser> {
    try {
      const record = await tables.users.create({
        username: user.username,
        email: user.email,
        password: user.password,
        role: user.role,
        allergies: JSON.stringify(user.allergies),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return {
        id: record.id,
        username: record.get('username') as string,
        email: record.get('email') as string,
        password: record.get('password') as string,
        role: record.get('role') as 'user' | 'admin',
        allergies: JSON.parse(record.get('allergies') as string || '[]'),
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
      };
    } catch (error) {
      throw new AirtableError('Erreur lors de la création de l\'utilisateur');
    }
  },

  async getUserById(id: string): Promise<AirtableUser | null> {
    try {
      const record = await tables.users.find(id);
      return {
        id: record.id,
        username: record.get('username') as string,
        email: record.get('email') as string,
        password: record.get('password') as string,
        role: record.get('role') as 'user' | 'admin',
        allergies: JSON.parse(record.get('allergies') as string || '[]'),
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
      };
    } catch (error) {
      if ((error as any).error === 'NOT_FOUND') {
        return null;
      }
      throw new AirtableError('Erreur lors de la récupération de l\'utilisateur');
    }
  },

  async updateUser(id: string, data: Partial<AirtableUser>): Promise<AirtableUser> {
    try {
      const updateData: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      };
      if (data.username) updateData.username = data.username;
      if (data.email) updateData.email = data.email;
      if (data.password) updateData.password = data.password;
      if (data.role) updateData.role = data.role;
      if (data.allergies) updateData.allergies = JSON.stringify(data.allergies);
      const record = await tables.users.update(id, updateData);
      return {
        id: record.id,
        username: record.get('username') as string,
        email: record.get('email') as string,
        password: record.get('password') as string,
        role: record.get('role') as 'user' | 'admin',
        allergies: JSON.parse(record.get('allergies') as string || '[]'),
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
      };
    } catch (error) {
      throw new AirtableError('Erreur lors de la mise à jour de l\'utilisateur');
    }
  },

  async getAllUsers(): Promise<AirtableUser[]> {
    try {
      const records = await tables.users.select().all();
      return records.map(record => ({
        id: record.id,
        username: record.get('username') as string,
        email: record.get('email') as string,
        password: record.get('password') as string,
        role: record.get('role') as 'user' | 'admin',
        allergies: JSON.parse(record.get('allergies') as string || '[]'),
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
      }));
    } catch (error) {
      throw new AirtableError('Erreur lors de la récupération des utilisateurs');
    }
  },
}; 