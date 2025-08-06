class EncryptionService {
  private static instance: EncryptionService;

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  async generateKey(password: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    const hash = await crypto.subtle.digest('SHA-256', data);
    const key = await crypto.subtle.importKey(
      'raw',
      hash,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
    
    return key;
  }

  async encrypt(data: any, password: string): Promise<string> {
    try {
      const key = await this.generateKey(password);
      const jsonString = JSON.stringify(data);
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(jsonString);
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
      );
      
      const encryptedArray = new Uint8Array(encryptedData);
      const combined = new Uint8Array(iv.length + encryptedArray.length);
      combined.set(iv);
      combined.set(encryptedArray, iv.length);
      
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  async decrypt(encryptedData: string, password: string): Promise<any> {
    try {
      const key = await this.generateKey(password);
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );
      
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);
      
      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );
      
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decryptedData);
      
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data. Check your password.');
    }
  }

  async exportEncryptedData(data: any, password: string): Promise<Blob> {
    const encrypted = await this.encrypt(data, password);
    const exportData = {
      version: '1.0.0',
      encryptedAt: new Date().toISOString(),
      encrypted: true,
      data: encrypted
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    return blob;
  }

  async importEncryptedData(file: File, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const importData = JSON.parse(content);
          
          if (!importData.encrypted || !importData.data) {
            throw new Error('Invalid encrypted file format');
          }
          
          const decrypted = await this.decrypt(importData.data, password);
          resolve(decrypted);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  validatePassword(password: string): boolean {
    // Password must be at least 8 characters with at least one letter and one number
    const minLength = 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return password.length >= minLength && hasLetter && hasNumber;
  }
}

export const encryptionService = EncryptionService.getInstance();