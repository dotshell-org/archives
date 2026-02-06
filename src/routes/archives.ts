import { Router, Request, Response } from 'express';
import * as path from 'path';
import { ArchiveScanner } from '../services/archiveScanner';

export function createArchiveRouter(scanner: ArchiveScanner): Router {
  const router = Router();

  // GET / - Liste toutes les archives
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const archives = await scanner.getAllArchives();
      res.json(archives);
    } catch (error) {
      console.error('Error fetching archives:', error);
      res.status(500).json({ error: 'Failed to fetch archives' });
    }
  });

  // GET /:id - Récupère une archive par son ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const archive = await scanner.getArchiveById(req.params.id);
      if (!archive) {
        res.status(404).json({ error: 'Archive not found' });
        return;
      }
      res.json(archive);
    } catch (error) {
      console.error('Error fetching archive:', error);
      res.status(500).json({ error: 'Failed to fetch archive' });
    }
  });

  // GET /file/* - Télécharge un fichier par son chemin relatif
  router.get('/file/*', (req: Request, res: Response) => {
    try {
      const relativePath = req.params[0];
      const filePath = scanner.getFilePath(relativePath);

      if (!filePath) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      const filename = path.basename(filePath);
      const download = req.query.download === 'true';

      if (download) {
        res.download(filePath, filename);
      } else {
        res.sendFile(filePath);
      }
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({ error: 'Failed to serve file' });
    }
  });

  return router;
}
