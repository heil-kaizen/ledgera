import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { BentoCard, CardActionButton } from "@/components/ui/BentoCard";
import { 
  ShieldCheck, 
  Globe, 
  BarChart3, 
  Users, 
  ArrowRight,
  Search,
  Activity
} from "lucide-react";

interface Charity {
  id: string;
  charity_name: string;
  description: string;
  website: string;
  status: string;
  created_at: string;
}

export default function Transparency() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDist: 0,
    activeProjects: 0,
    proofsCount: 0
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const { data: charityData } = await supabase
          .from("charity_applications")
          .select("*")
          .in("status", ["approved", "pending"])
          .order("created_at", { ascending: false });
        
        const { count: proofsCount } = await supabase
          .from("payout_proofs")
          .select("*", { count: 'exact', head: true });

        const { data: proofsData } = await supabase
          .from("payout_proofs")
          .select("amount_usd");

        const totalUsd = proofsData?.reduce((acc, curr) => acc + (Number(curr.amount_usd) || 0), 0) || 0;

        setCharities(charityData || []);
        setStats({
          totalDist: totalUsd,
          activeProjects: charityData?.length || 0,
          proofsCount: proofsCount || 0
        });
      } catch (err) {
        console.error("Transparency fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 font-sans">
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-serif text-charity-darker mb-6 tracking-tight">Trust but verify.</h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          The public ledger of verified non-profits and their real-world impact. See every dollar, every crypto transaction, and every proof of payout.
        </p>
      </div>

      {/* Global Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        <div className="bg-charity-dark text-white p-10 rounded-[2.5rem] flex flex-col justify-between min-h-[220px]">
           <div className="flex justify-between items-start">
             <span className="text-sm font-bold uppercase tracking-widest text-charity-accent/60">Total Distributed</span>
             <BarChart3 className="h-6 w-6 text-charity-accent" />
           </div>
           <div className="mt-auto">
             <p className="text-5xl font-serif leading-none">${stats.totalDist.toLocaleString()}</p>
             <p className="text-xs mt-3 opacity-60">Real-time USD valuation at payout</p>
           </div>
        </div>

        <div className="bg-white border border-charity-darker/5 p-10 rounded-[2.5rem] flex flex-col justify-between min-h-[220px]">
           <div className="flex justify-between items-start">
             <span className="text-sm font-bold uppercase tracking-widest text-charity-dark/40">Verified Charities</span>
             <ShieldCheck className="h-6 w-6 text-charity-dark" />
           </div>
           <div className="mt-auto">
             <p className="text-5xl font-serif leading-none text-charity-darker">{stats.activeProjects}</p>
             <p className="text-xs mt-3 text-gray-400">Strictly vetted NGOs only</p>
           </div>
        </div>

        <div className="bg-charity-accent text-charity-darker p-10 rounded-[2.5rem] flex flex-col justify-between min-h-[220px]">
           <div className="flex justify-between items-start">
             <span className="text-sm font-bold uppercase tracking-widest opacity-40">Proof of Impact</span>
             <Activity className="h-6 w-6 opacity-60" />
           </div>
           <div className="mt-auto">
             <p className="text-5xl font-serif leading-none">{stats.proofsCount}</p>
             <p className="text-xs mt-3 opacity-60">On-chain proofs documented</p>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <h2 className="text-3xl font-serif text-charity-darker">Organizations</h2>
        <div className="relative max-w-sm w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
           <input 
            placeholder="Search charity name..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-charity-darker/5 rounded-full text-sm outline-none focus:ring-1 focus:ring-charity-dark transition-all"
           />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white/50 border border-charity-darker/5 h-80 rounded-[2.5rem] animate-pulse"></div>
          ))}
        </div>
      ) : charities.length === 0 ? (
        <div className="text-center py-20 bg-white/50 rounded-[2.5rem] border border-dashed border-charity-darker/10">
           <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
           <p className="text-xl font-serif text-charity-darker/40">No charities verified yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charities.map((charity) => (
            <BentoCard 
              key={charity.id} 
              to={`/transparency/${charity.id}`}
              className="group min-h-[320px] bg-white border border-charity-darker/5 hover:border-charity-dark/20 p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-charity-light h-14 w-14 rounded-2xl flex items-center justify-center">
                    <Globe className="h-6 w-6 text-charity-dark opacity-40" />
                  </div>
                  <div className={
                    charity.status === 'pending'
                      ? "bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200 flex items-center gap-1 text-yellow-700" 
                      : "bg-charity-accent/10 px-3 py-1 rounded-full border border-charity-accent/20 flex items-center gap-1"
                  }>
                    <ShieldCheck className={`h-3 w-3 ${charity.status === 'pending' ? 'text-yellow-700' : 'text-charity-dark'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-tight ${charity.status === 'pending' ? 'text-yellow-700' : 'text-charity-dark'}`}>
                      {charity.status === 'pending' ? 'Pending' : 'Verified'}
                    </span>
                  </div>
                </div>
                <h3 className="text-2xl font-serif text-charity-darker mb-2 group-hover:text-charity-dark transition-colors">{charity.charity_name}</h3>
                <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                  {charity.description}
                </p>
              </div>
              <div className="flex items-center justify-between mt-8 border-t border-charity-darker/5 pt-6">
                 <span className="text-xs font-bold uppercase tracking-widest text-charity-darker/40 group-hover:text-charity-dark transition-colors">See impact</span>
                 <CardActionButton variant="dark" className="h-10 w-10 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
            </BentoCard>
          ))}
        </div>
      )}
    </div>
  );
}
