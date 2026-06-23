import { useState } from 'react';
import { MessageSquare, Plus, ArrowUpRight, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';

const newsItems = [
  {
    id: 1,
    title: "New Records Established",
    date: "June 17, 2026 • Federation Update",
    author: "Bessie Cooper",
    authorInitials: "BC",
    previewText: "Tilogi ip-tv. Dideng euroledes. Min spepikas, demoskop. Nes megagōliga devis.",
    fullContent: "Presegen pinas. Nyn halvtaktsjobb, jag holigt. Decidat resovår. Tremön sesam etnovision. Nipobyvis höprek. Megt migös.",
    image: "/Images/CycleImage8.png"
  },
  {
    id: 2,
    title: "Project Milestone Reached",
    date: "June 16, 2026 • Development Update",
    author: "Ahmad Khan",
    authorInitials: "AK",
    previewText: "The system architecture has been successfully migrated to the new cloud infrastructure.",
    fullContent: "This allows for faster deployment cycles, improved security, and significantly lower latency.",
    image: "/Images/CycleImage8.png"
  },
  {
    id: 3,
    title: "Quarterly Security Audit",
    date: "June 15, 2026 • Security Ops",
    author: "Sarah Jenkins",
    authorInitials: "SJ",
    previewText: "We have successfully completed our Q2 security audit with zero critical vulnerabilities found.",
    fullContent: "The audit covered all major endpoints and API gateways. We have updated our encryption protocols to ensure that all user data remains protected against emerging threats.",
    image: "/Images/CycleImage8.png"
  },
  {
    id: 4,
    title: "Community Growth Initiative",
    date: "June 14, 2026 • Community Outreach",
    author: "Marcus Thorne",
    authorInitials: "MT",
    previewText: "Our community has officially surpassed 50,000 active members this week.",
    fullContent: "To celebrate this milestone, we are launching a series of community-led workshops starting next month to foster better collaboration and learning.",
    image: "/Images/CycleImage8.png"
  }
];

const NewsArticle = ({ item }: { item: typeof newsItems[0] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="group relative bg-surface border border-border rounded-3xl p-6 sm:p-8 overflow-hidden transition-all duration-700 ease-out hover:border-[#EB712B]/40 hover:-translate-y-1 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-[#EB712B]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
        {/* Icon - Hidden on very small screens or kept small */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center rounded-2xl bg-hover border border-border group-hover:bg-[#EB712B] group-hover:scale-105 transition-all duration-500 ease-in-out">
          <Newspaper className="text-[#EB712B] group-hover:text-white transition-colors duration-500" size={24} />
        </div>

        <div className="flex-1 space-y-4 w-full">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-text-main group-hover:text-[#EB712B] transition-colors duration-300 leading-tight">
                {item.title}
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">{item.date}</p>
            </div>
            <div className="shrink-0 group-hover:translate-x-1 transition-transform duration-300">
              <ArrowUpRight className="text-text-muted opacity-50 group-hover:text-[#EB712B] transition-colors" size={20} />
            </div>
          </div>

          <div className="transition-all duration-500 ease-in-out space-y-4">
            <p className="text-sm text-text-muted leading-relaxed">
              {item.previewText}
              {!isExpanded && (
                <button onClick={() => setIsExpanded(true)} className="ml-2 font-bold text-[#EB712B] underline underline-offset-4 cursor-pointer">
                  Read More
                </button>
              )}
            </p>

            {isExpanded && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                <img src={item.image} alt="Article visual" className="w-full h-40 sm:h-48 object-cover rounded-2xl border border-border" />
                <p className="text-sm text-text-muted leading-relaxed">
                  {item.fullContent}
                  <button onClick={() => setIsExpanded(false)} className="ml-2 font-bold text-[#EB712B] underline underline-offset-4 cursor-pointer">
                    Show Less
                  </button>
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-surface flex items-center justify-center text-[8px] font-black text-[#EB712B] border border-border">{item.authorInitials}</div>
              <span className="text-xs font-bold text-text-main truncate max-w-[100px]">{item.author}</span>
            </div>
            <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-[#EB712B] transition-colors cursor-pointer">
              <MessageSquare size={12} /> 25
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

interface NewsFeedProps {
  clubId?: string | number;
}

export const NewsFeed: React.FC<NewsFeedProps> = () => (
  <div className="min-h-screen text-text-main bg-main-bg p-4 sm:p-6 md:p-16 font-sans">
    <header className="max-w-4xl mx-auto mb-8 sm:mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter text-text-main">Community News</h1>
        <Link 
          to="/news/add" 
          className="flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-[#EB712B]/50 text-[#EB712B] rounded-xl hover:bg-[#EB712B] hover:text-white transition-all duration-300 text-xs font-bold tracking-widest w-full sm:w-auto text-center"
        >
          <Plus size={18} /> Add new Post
        </Link>
      </div>
    </header>
    <main className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {newsItems.map((item) => <NewsArticle key={item.id} item={item} />)}
    </main>
  </div>
);

export default NewsFeed;