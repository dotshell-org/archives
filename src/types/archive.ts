export interface ArchiveFile {
  name: string;
  path: string;
}

export interface ArchiveScreenshot {
  name: string;
  path: string;
}

export interface ArchiveSummary {
  id: string;
  name: string;
}

export interface Archive {
  id: string;
  name: string;
  readme: string | null;
  screenshots: ArchiveScreenshot[];
  files: ArchiveFile[];
}
