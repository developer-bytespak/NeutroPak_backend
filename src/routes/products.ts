import { Router, Request, Response } from 'express';

const router = Router();

// Get all products
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Get all products', products: [] });
});

// Get product by ID
router.get('/:id', (req: Request, res: Response) => {
  res.json({ message: 'Get product by ID', productId: req.params.id });
});

// Create product
router.post('/', (req: Request, res: Response) => {
  res.json({ message: 'Create product', product: req.body });
});

// Update product
router.put('/:id', (req: Request, res: Response) => {
  res.json({ message: 'Update product', productId: req.params.id, data: req.body });
});

// Delete product
router.delete('/:id', (req: Request, res: Response) => {
  res.json({ message: 'Delete product', productId: req.params.id });
});

export default router;
