// pages/api/sites.js
import { readData, writeData, generateId } from '@/lib/data';

export default async function handler(req, res) {
  const data = await readData();

  if (req.method === 'GET') {
    // Optionally filter by category, region, search query
    const { category, region, search } = req.query;
    let sites = data.sites;

    if (category && category !== 'all') {
      sites = sites.filter(s => s.category === category);
    }
    if (region && region !== 'all') {
      sites = sites.filter(s => s.region === region);
    }
    if (search) {
      const q = search.toLowerCase();
      sites = sites.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return res.status(200).json(sites);
  }

  if (req.method === 'POST') {
    const { name, url, description, category, region, tags, isTrusted, isNew, isFeatured } = req.body;
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }
    const newSite = {
      id: generateId(),
      name,
      url,
      description: description || '',
      category,
      region,
      tags: tags || [],
      isTrusted: !!isTrusted,
      isNew: !!isNew,
      isFeatured: !!isFeatured,
      createdAt: Date.now(),
    };
    data.sites.push(newSite);
    await writeData(data);
    return res.status(201).json(newSite);
  }

  if (req.method === 'PUT') {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ error: 'ID required' });
    const index = data.sites.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ error: 'Site not found' });
    data.sites[index] = { ...data.sites[index], ...updates };
    await writeData(data);
    return res.status(200).json(data.sites[index]);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID required' });
    data.sites = data.sites.filter(s => s.id !== id);
    await writeData(data);
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
