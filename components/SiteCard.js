// components/SiteCard.js
export default function SiteCard({ site }) {
  const regionEmoji = {
    'Global': '🌐',
    'US': '🇺🇸',
    'UK': '🇬🇧',
    'CA': '🇨🇦',
    'AU': '🇦🇺',
    'IN': '🇮🇳',
    'DE': '🇩🇪',
    'FR': '🇫🇷',
    'JP': '🇯🇵',
  }[site.region] || '🌍';

  return (
    <div className="site-card bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 hover:bg-white/10 hover:border-[#8b5cf6]/30 transition-all cursor-pointer">
      <div className="flex items-start justify-between gap-3 sm:gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-base">{site.name}</h3>
            {site.tags.map(tag => (
              <span key={tag} className={`badge ${tag === 'trusted' ? 'badge-trusted' : tag === 'new' ? 'badge-new' : 'badge-featured'}`}>
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </span>
            ))}
          </div>
          <p className="text-[#a1a1aa] text-sm mt-1">{site.description || 'No description'}</p>
          <div className="flex items-center gap-x-3 gap-y-1 flex-wrap mt-2 text-xs text-[#52525b]">
            <span>{site.category}</span>
            <span>•</span>
            <span>{regionEmoji} {site.region}</span>
            <span>•</span>
            <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-[#8b5cf6] hover:underline inline-flex items-center gap-1 py-1 -my-1">
              Visit <i className="fas fa-arrow-up-right-from-square text-[10px]"></i>
            </a>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[#52525b] text-xs shrink-0">
          <i className="far fa-clock"></i>
          <span>{timeAgo(site.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  if (days < 7) return days + 'd ago';
  return new Date(ts).toLocaleDateString();
}