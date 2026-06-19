export default async function handler(req, res) {
  const { niche, minSubs, maxSubs } = req.query;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }
  if (!niche) {
    return res.status(400).json({ error: 'Niche is required' });
  }

  const min = parseInt(minSubs) || 0;
  const max = parseInt(maxSubs) || 999999999;

  try {
    let allChannelIds = [];
    let nextPageToken = '';

    for (let i = 0; i < 3; i++) {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=50&q=${encodeURIComponent(niche)}&key=${apiKey}${nextPageToken ? '&pageToken=' + nextPageToken : ''}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      if (searchData.error) throw new Error(searchData.error.message);

      const ids = searchData.items.map(it => it.snippet.channelId || it.id.channelId).filter(Boolean);
      allChannelIds.push(...ids);

      if (!searchData.nextPageToken) break;
      nextPageToken = searchData.nextPageToken;
    }

    allChannelIds = [...new Set(allChannelIds)];
    if (allChannelIds.length === 0) {
      return res.status(200).json({ results: [] });
    }

    let allChannels = [];
    for (let i = 0; i < allChannelIds.length; i += 50) {
      const batch = allChannelIds.slice(i, i + 50);
      const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${batch.join(',')}&key=${apiKey}`;
      const statsRes = await fetch(statsUrl);
      const statsData = await statsRes.json();
      if (statsData.error) throw new Error(statsData.error.message);
      allChannels.push(...statsData.items);
    }

    const filtered = allChannels.filter(ch => {
      const subs = parseInt(ch.statistics.subscriberCount || 0);
      return subs >= min && subs <= max;
    });

    const results = filtered.slice(0, 35).map(ch => {
      const desc = ch.snippet.description || '';
      const emailMatch = desc.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      return {
        id: ch.id,
        name: ch.snippet.title,
        subs: Number(ch.statistics.subscriberCount || 0).toLocaleString(),
        category: detectCategory(ch.snippet.title, desc),
        url: `https://www.youtube.com/channel/${ch.id}`,
        email: emailMatch ? emailMatch[0] : 'N/A',
        thumb: ch.snippet.thumbnails?.default?.url || ''
      };
    });

    res.status(200).json({ results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

function detectCategory(title, desc) {
  const t = (title + ' ' + desc).toLowerCase();
  const map = {
    Tech: ['tech', 'gadget', 'review', 'ai', 'software', 'coding', 'programming'],
    Finance: ['finance', 'money', 'invest', 'stock', 'crypto', 'trading'],
    Fitness: ['fitness', 'gym', 'workout', 'health', 'yoga'],
    Gaming: ['gaming', 'gameplay', 'esports', 'gamer'],
    Educator: ['tutorial', 'learn', 'education', 'course'],
    Vlogger: ['vlog', 'daily', 'lifestyle'],
    Food: ['food', 'cooking', 'recipe', 'chef'],
    Travel: ['travel', 'trip', 'explore']
  };
  for (const [cat, words] of Object.entries(map)) {
    if (words.some(w => t.includes(w))) return cat;
  }
  return 'Creator';
      }
