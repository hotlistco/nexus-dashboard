const FEED_URL = 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml';

function extractText(xml, tag) {
  const cdataMatch = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i').exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();
  const plainMatch = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(xml);
  if (plainMatch) return plainMatch[1].trim();
  return null;
}

function extractMediaImage(itemXml) {
  const re = /<media:content[^>]+medium="image"[^>]+url="([^"]+)"/i;
  const alt = /<media:content[^>]+url="([^"]+)"[^>]+medium="image"/i;
  const m = re.exec(itemXml) || alt.exec(itemXml);
  return m ? m[1] : null;
}

function parseItems(xml) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRe.exec(xml)) !== null && items.length < 6) {
    const block = match[1];
    const title = extractText(block, 'title');
    const description = extractText(block, 'description');
    const pubDate = extractText(block, 'pubDate');
    const image = extractMediaImage(block);

    if (!title) continue;

    const date = pubDate ? new Date(pubDate).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    }) : null;

    items.push({ title, description: description || null, date, image: image || null });
  }
  return items;
}

export async function getNytTech() {
  const response = await fetch(FEED_URL);
  if (!response.ok) throw new Error(`NYT Tech RSS fetch failed: ${response.status}`);
  const xml = await response.text();
  const items = parseItems(xml);
  if (!items.length) throw new Error('No items parsed from NYT Tech RSS feed');
  return { items };
}
