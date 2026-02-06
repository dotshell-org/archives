import * as fs from 'fs';
import * as path from 'path';
import {
  Archive,
  ArchiveFile,
  ArchiveScreenshot,
  ArchiveSummary,
} from '../types/archive';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
const IGNORED_FILES = ['.DS_Store', 'Thumbs.db', '.gitkeep'];

export class ArchiveScanner {
  private dataPath: string;

  constructor(dataPath: string) {
    this.dataPath = path.resolve(dataPath);
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
  }

  private generateId(name: string): string {
    return Buffer.from(name).toString('base64url');
  }

  private decodeId(id: string): string {
    return Buffer.from(id, 'base64url').toString('utf-8');
  }

  private isImageFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
  }

  private isIgnoredFile(filename: string): boolean {
    return IGNORED_FILES.includes(filename) || filename.startsWith('.');
  }

  private readReadme(dirPath: string): string | null {
    const readmePath = path.join(dirPath, 'README.md');
    if (fs.existsSync(readmePath)) {
      try {
        return fs.readFileSync(readmePath, 'utf-8');
      } catch {
        return null;
      }
    }
    return null;
  }

  async getAllArchives(): Promise<ArchiveSummary[]> {
    const archives: ArchiveSummary[] = [];
    const items = fs.readdirSync(this.dataPath);

    for (const item of items) {
      const itemPath = path.join(this.dataPath, item);
      if (fs.statSync(itemPath).isDirectory() && !item.startsWith('.')) {
        archives.push({
          id: this.generateId(item),
          name: item,
        });
      }
    }

    return archives;
  }

  async getArchiveById(id: string): Promise<Archive | null> {
    try {
      const name = this.decodeId(id);
      return this.getArchiveByName(name);
    } catch {
      return null;
    }
  }

  async getArchiveByName(name: string): Promise<Archive | null> {
    const archivePath = path.join(this.dataPath, name);

    if (!fs.existsSync(archivePath) || !fs.statSync(archivePath).isDirectory()) {
      return null;
    }

    const readme = this.readReadme(archivePath);
    const screenshots: ArchiveScreenshot[] = [];
    const files: ArchiveFile[] = [];

    // Lire les screenshots depuis le sous-dossier screenshots/
    const screenshotsPath = path.join(archivePath, 'screenshots');
    if (fs.existsSync(screenshotsPath) && fs.statSync(screenshotsPath).isDirectory()) {
      const items = fs.readdirSync(screenshotsPath);
      for (const item of items) {
        if (this.isIgnoredFile(item)) continue;
        const itemPath = path.join(screenshotsPath, item);
        if (fs.statSync(itemPath).isFile() && this.isImageFile(item)) {
          screenshots.push({ name: item, path: `${name}/screenshots/${item}` });
        }
      }
    }

    // Lire les fichiers depuis le sous-dossier files/
    const filesPath = path.join(archivePath, 'files');
    if (fs.existsSync(filesPath) && fs.statSync(filesPath).isDirectory()) {
      const items = fs.readdirSync(filesPath);
      for (const item of items) {
        if (this.isIgnoredFile(item)) continue;
        const itemPath = path.join(filesPath, item);
        if (fs.statSync(itemPath).isFile()) {
          files.push({ name: item, path: `${name}/files/${item}` });
        }
      }
    }

    return {
      id: this.generateId(name),
      name,
      readme,
      screenshots,
      files,
    };
  }

  getFilePath(relativePath: string): string | null {
    const fullPath = path.join(this.dataPath, relativePath);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return fullPath;
    }
    return null;
  }
}
