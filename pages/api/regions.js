// pages/api/regions.js
import { readData, writeData } from '@/lib/data';

export default async function handler(req, res) {
  const data = await readData();

  if (req.method === 'GET') {
    return res.status(200).json(data.regions);
  }

  if (req.method === 'POST') {
    const { name } = req.body;
    if (!name || data.regions.includes(name)) {
      return res.status(400).json({ error: 'Invalid or duplicate region' });
    }
    data.regions.push(name);
    await writeData(data);
    return res.status(201).json(data.regions);
  }

  if (req.method === 'DELETE') {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'Region name required' });
    data.regions = data.regions.filter(r => r !== name);
    await writeData(data);
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
