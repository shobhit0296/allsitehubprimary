// pages/api/categories.js
import { readData, writeData } from '@/lib/data';

export default async function handler(req, res) {
  const data = await readData();

  if (req.method === 'GET') {
    return res.status(200).json(data.categories);
  }

  if (req.method === 'POST') {
    const { name } = req.body;
    if (!name || data.categories.includes(name)) {
      return res.status(400).json({ error: 'Invalid or duplicate category' });
    }
    data.categories.push(name);
    await writeData(data);
    return res.status(201).json(data.categories);
  }

  if (req.method === 'DELETE') {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'Category name required' });
    data.categories = data.categories.filter(c => c !== name);
    await writeData(data);
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
