import { Router, Request, Response } from 'express';

const router = Router();

// Get all users
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Get all users', users: [] });
});

// Get user by ID
router.get('/:id', (req: Request, res: Response) => {
  res.json({ message: 'Get user by ID', userId: req.params.id });
});

// Create user
router.post('/', (req: Request, res: Response) => {
  res.json({ message: 'Create user', user: req.body });
});

// Update user
router.put('/:id', (req: Request, res: Response) => {
  res.json({ message: 'Update user', userId: req.params.id, data: req.body });
});

// Delete user
router.delete('/:id', (req: Request, res: Response) => {
  res.json({ message: 'Delete user', userId: req.params.id });
});

export default router;
