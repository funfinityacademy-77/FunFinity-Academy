// HDD File System Logic for FunFinity Academy
// Clean backend integration for local file storage
// TODO: BACKEND - Replace with actual file system operations

import { promises as fs } from 'fs';
import { join } from 'path';

// File metadata interface
interface FileMetadata {
  id: string;
  user_id: string;
  original_name: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_type: string;
  is_public: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Storage configuration
const storageConfig = {
  baseDirectory: process.env.STORAGE_BASE_DIR || join(process.cwd(), 'storage'),
  maxFileSize: 100 * 1024 * 1024, // 100MB per file
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/json',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
  ],
  directoryStructure: {
    avatars: 'avatars',
    documents: 'documents',
    images: 'images',
    videos: 'videos',
    audio: 'audio',
    chat_files: 'chat_files',
    backups: 'backups',
    temp: 'temp',
  },
};

// File system service class
export class FileSystemService {
  private static instance: FileSystemService;
  private baseDirectory: string;

  private constructor() {
    this.baseDirectory = storageConfig.baseDirectory;
    this.initializeStorage();
  }

  public static getInstance(): FileSystemService {
    if (!FileSystemService.instance) {
      FileSystemService.instance = new FileSystemService();
    }
    return FileSystemService.instance;
  }

  // Initialize storage directories
  private async initializeStorage(): Promise<void> {
    try {
      // TODO: BACKEND - Create base directory
      await fs.mkdir(this.baseDirectory, { recursive: true });

      // TODO: BACKEND - Create subdirectories
      for (const dirName of Object.values(storageConfig.directoryStructure)) {
        const dirPath = join(this.baseDirectory, dirName);
        await fs.mkdir(dirPath, { recursive: true });
      }

      console.log('File storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize file storage:', error);
      throw error;
    }
  }

  // Store file from buffer
  async storeFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    fileType: string,
    userId: string,
    isPublic: boolean = false
  ): Promise<FileMetadata> {
    try {
      // TODO: BACKEND - Validate file size
      if (buffer.length > storageConfig.maxFileSize) {
        throw new Error(`File size exceeds maximum allowed size of ${storageConfig.maxFileSize} bytes`);
      }

      // TODO: BACKEND - Validate mime type
      if (!storageConfig.allowedMimeTypes.includes(mimeType)) {
        throw new Error(`Mime type ${mimeType} is not allowed`);
      }

      // TODO: BACKEND - Generate unique file name
      const fileExtension = originalName.split('.').pop() || '';
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
      
      // TODO: BACKEND - Determine directory based on file type
      const directory = this.getDirectoryForFileType(fileType);
      const filePath = join(this.baseDirectory, directory, fileName);

      // TODO: BACKEND - Write file to disk
      await fs.writeFile(filePath, buffer);

      // TODO: BACKEND - Create metadata (this should be stored in database)
      const metadata: FileMetadata = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        original_name: originalName,
        file_name: fileName,
        file_path: filePath,
        file_size: buffer.length,
        mime_type: mimeType,
        file_type: fileType,
        is_public: isPublic,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      return metadata;
    } catch (error) {
      console.error('Error storing file:', error);
      throw error;
    }
  }

  // Get file as buffer
  async getFile(filePath: string): Promise<Buffer> {
    try {
      // TODO: BACKEND - Validate file path is within storage directory
      if (!this.isValidPath(filePath)) {
        throw new Error('Invalid file path');
      }

      // TODO: BACKEND - Check if file exists
      await fs.access(filePath);

      // TODO: BACKEND - Read file
      return await fs.readFile(filePath);
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }

  // Delete file
  async deleteFile(filePath: string): Promise<void> {
    try {
      // TODO: BACKEND - Validate file path is within storage directory
      if (!this.isValidPath(filePath)) {
        throw new Error('Invalid file path');
      }

      // TODO: BACKEND - Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        // File doesn't exist, nothing to delete
        return;
      }

      // TODO: BACKEND - Delete file
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Move file
  async moveFile(oldPath: string, newPath: string): Promise<void> {
    try {
      // TODO: BACKEND - Validate paths are within storage directory
      if (!this.isValidPath(oldPath) || !this.isValidPath(newPath)) {
        throw new Error('Invalid file path');
      }

      // TODO: BACKEND - Ensure target directory exists
      const targetDir = newPath.substring(0, newPath.lastIndexOf('/'));
      await fs.mkdir(targetDir, { recursive: true });

      // TODO: BACKEND - Move file
      await fs.rename(oldPath, newPath);
    } catch (error) {
      console.error('Error moving file:', error);
      throw error;
    }
  }

  // Get file info
  async getFileInfo(filePath: string): Promise<{
    size: number;
    created: Date;
    modified: Date;
    isDirectory: boolean;
  }> {
    try {
      // TODO: BACKEND - Validate file path is within storage directory
      if (!this.isValidPath(filePath)) {
        throw new Error('Invalid file path');
      }

      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isDirectory: stats.isDirectory(),
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      throw error;
    }
  }

  // List files in directory
  async listFiles(directory: string, recursive: boolean = false): Promise<string[]> {
    try {
      // TODO: BACKEND - Validate directory path is within storage directory
      const fullPath = join(this.baseDirectory, directory);
      if (!this.isValidPath(fullPath)) {
        throw new Error('Invalid directory path');
      }

      if (recursive) {
        const files: string[] = [];
        const items = await fs.readdir(fullPath, { withFileTypes: true });

        for (const item of items) {
          const itemPath = join(fullPath, item.name);
          
          if (item.isDirectory()) {
            const subFiles = await this.listFiles(itemPath, true);
            files.push(...subFiles);
          } else {
            files.push(itemPath);
          }
        }

        return files;
      } else {
        const items = await fs.readdir(fullPath, { withFileTypes: true });
        return items
          .filter(item => !item.isDirectory())
          .map(item => join(fullPath, item.name));
      }
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  // Clean up temporary files
  async cleanupTempFiles(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      // TODO: BACKEND - Clean up old temporary files
      const tempDir = join(this.baseDirectory, storageConfig.directoryStructure.temp);
      const files = await this.listFiles(storageConfig.directoryStructure.temp, true);
      const now = Date.now();

      for (const file of files) {
        const stats = await fs.stat(file);
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(file);
        }
      }

      console.log('Cleaned up temporary files');
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }

  // Get storage statistics
  async getStorageStats(): Promise<{
    totalSize: number;
    fileCount: number;
    directoryStats: Record<string, { size: number; count: number }>;
  }> {
    try {
      // TODO: BACKEND - Calculate storage statistics
      let totalSize = 0;
      let fileCount = 0;
      const directoryStats: Record<string, { size: number; count: number }> = {};

      for (const [dirName, dirPath] of Object.entries(storageConfig.directoryStructure)) {
        const fullPath = join(this.baseDirectory, dirPath);
        const files = await this.listFiles(dirName, true);
        
        let dirSize = 0;
        let dirCount = 0;

        for (const file of files) {
          const stats = await fs.stat(file);
          dirSize += stats.size;
          dirCount++;
        }

        directoryStats[dirName] = { size: dirSize, count: dirCount };
        totalSize += dirSize;
        fileCount += dirCount;
      }

      return {
        totalSize,
        fileCount,
        directoryStats,
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw error;
    }
  }

  // Validate file path is within storage directory
  private isValidPath(filePath: string): boolean {
    const resolvedPath = filePath;
    const resolvedBase = this.baseDirectory;
    return resolvedPath.startsWith(resolvedBase);
  }

  // Get directory for file type
  private getDirectoryForFileType(fileType: string): string {
    const typeDirectoryMap: Record<string, string> = {
      avatar: storageConfig.directoryStructure.avatars,
      document: storageConfig.directoryStructure.documents,
      image: storageConfig.directoryStructure.images,
      video: storageConfig.directoryStructure.videos,
      audio: storageConfig.directoryStructure.audio,
      chat_file: storageConfig.directoryStructure.chat_files,
    };

    return typeDirectoryMap[fileType] || storageConfig.directoryStructure.documents;
  }

  // Create backup of file
  async createBackup(filePath: string): Promise<string> {
    try {
      // TODO: BACKEND - Create backup of file
      if (!this.isValidPath(filePath)) {
        throw new Error('Invalid file path');
      }

      const buffer = await this.getFile(filePath);
      
      const backupDir = join(this.baseDirectory, storageConfig.directoryStructure.backups);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const originalName = filePath.split('/').pop() || 'backup';
      const backupPath = join(backupDir, `${timestamp}-${originalName}`);

      await fs.writeFile(backupPath, buffer);

      return backupPath;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  // Restore from backup
  async restoreFromBackup(backupPath: string, targetPath: string): Promise<void> {
    try {
      // TODO: BACKEND - Restore file from backup
      if (!this.isValidPath(backupPath) || !this.isValidPath(targetPath)) {
        throw new Error('Invalid file path');
      }

      const buffer = await this.getFile(backupPath);

      await fs.writeFile(targetPath, buffer);
    } catch (error) {
      console.error('Error restoring from backup:', error);
      throw error;
    }
  }

  // Get base directory
  getBaseDirectory(): string {
    return this.baseDirectory;
  }

  // Get storage configuration
  getStorageConfig() {
    return storageConfig;
  }
}

// Export singleton instance
export const fileSystem = FileSystemService.getInstance();

// Export types
export type { FileMetadata };
