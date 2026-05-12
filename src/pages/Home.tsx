import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { BentoCard, CardActionButton } from "@/components/ui/BentoCard";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight, Heart, HeartHandshake, ShieldCheck, Link2, FileCheck } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [stats, setStats] = useState({
    approvedCharities: 0,
    totalDistributed: 0,
    latestPayoutAmount: 0,
    latestPayoutDesc: "No payouts yet",
    walletsCount: 0
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const fetchStats = async () => {
      try {
        // 1. Approved Charities
        const { count: approvedCount } = await supabase
          .from("charity_applications")
          .select("*", { count: "exact", head: true })
          .eq("status", "approved");

        // 2. Wallets Count
        const { count: walletsCount } = await supabase
          .from("charity_wallets")
          .select("*", { count: "exact", head: true });

        // 3. Payouts (Total + Latest)
        const { data: proofs } = await supabase
          .from("payout_proofs")
          .select("amount_usd, description, created_at")
          .order("created_at", { ascending: false });

        let total = 0;
        let latestAmount = 0;
        let latestDesc = "No payouts yet";
        
        if (proofs && proofs.length > 0) {
          total = proofs.reduce((acc, p) => acc + (Number(p.amount_usd) || 0), 0);
          latestAmount = Number(proofs[0].amount_usd) || 0;
          latestDesc = proofs[0].description || "Latest Impact";
        }

        setStats({
          approvedCharities: approvedCount || 0,
          totalDistributed: total,
          latestPayoutAmount: latestAmount,
          latestPayoutDesc: latestDesc,
          walletsCount: walletsCount || 0
        });

      } catch (e) {
        console.error("Failed to fetch home stats:", e);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen fade-in overflow-x-hidden flex flex-col">
      {/* SECTION 1: Hero & Bento Grid */}
      <div className="relative z-0">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto text-center pt-24 pb-16 px-4">
          <h1 className="text-5xl font-serif leading-[1.1] mb-6 max-w-3xl mx-auto text-charity-darker">
            Great futures are built <br className="hidden md:block"/> with a small charity
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            A public transparency layer for crypto-powered charity funding.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <RouterLink to={session ? "/apply" : "/login"}>
              <Button variant="dark" className="rounded-full px-8 py-6 text-base font-medium">Donate now</Button>
            </RouterLink>
          </div>
        </section>

        {/* Bento Grid Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#FDFBF7]">
          <div className="flex flex-col md:grid md:grid-cols-4 md:grid-rows-3 gap-4 md:gap-5 flex-grow mb-16 pt-8">

            {/* 1. Stat Card */}
            <BentoCard to={session ? "/apply" : "/login"} variant="dark" className="md:row-span-2 flex flex-col justify-between overflow-hidden relative min-h-[380px] group cursor-pointer hover:opacity-95 transition-opacity">
              {/* Background pattern suggestion */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,1) 10px, rgba(255,255,255,1) 11px)' }}></div>
              
              <div className="relative z-10 z-10">
                <h2 className="text-6xl md:text-7xl font-serif leading-none mb-4 pt-4 tracking-tight">${stats.totalDistributed.toLocaleString()}</h2>
                <p className="text-sm opacity-80 leading-relaxed pr-4 font-light text-white">
                  Distributed on-chain via verified smart contracts. Explore the impact dashboard.
                </p>
              </div>
              <div className="flex justify-between items-center mt-8 relative z-10 w-full mb-2">
                 <span className="font-sans font-medium hover:underline cursor-pointer">Donate now</span>
                 <CardActionButton variant="accent" />
              </div>
            </BentoCard>

            {/* 2. Health Image Card */}
            <BentoCard variant="image" className="md:row-span-2 p-0 min-h-[380px] group cursor-pointer overflow-hidden">
                 <img src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1000&auto=format&fit=crop" alt="Smiling child" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                 <div className="absolute inset-0 bg-[#062F23]/20 z-10"></div>
                 <div className="relative z-20 h-full flex flex-col justify-end p-6 md:p-8 text-white">
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest">
                        Health
                      </span>
                    </div>
                    <h3 className="text-xl font-serif leading-tight">
                      Funding vetted global initiatives
                    </h3>
                 </div>
            </BentoCard>

            {/* 3. Approved Charities Card */}
            <BentoCard to="/transparency" variant="light" className="flex flex-col justify-center items-center text-center p-8 min-h-[180px] cursor-pointer hover:opacity-95 transition-opacity group">
               <h3 className="text-2xl font-serif mb-2 leading-tight text-charity-darker">{stats.approvedCharities}</h3>
               <h3 className="text-sm font-serif mb-2 leading-tight text-charity-darker uppercase tracking-wider">Approved Charities</h3>
               <div className="flex items-center gap-2 mt-2 text-sm font-semibold text-charity-darker cursor-pointer hover:opacity-80 transition-opacity">
                   <span>View Directory</span>
                   <ArrowUpRight className="h-4 w-4 stroke-[3]" />
               </div>
            </BentoCard>

            {/* 4. Hands Image Card */}
            <BentoCard to="/transparency" variant="accent" className="md:row-span-2 p-0 relative min-h-[380px] overflow-hidden group cursor-pointer">
                 <img src="https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?q=80&w=1000&auto=format&fit=crop&grayscale=true" alt="Hands reaching" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-50 transition-transform duration-700 group-hover:scale-105" />
                 <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8">
                     <div className="w-full flex justify-end"></div>
                     <div className="flex justify-between items-center w-full mt-auto mb-2">
                         <span className="text-xl font-serif font-bold text-charity-darker">Explore more</span>
                         <CardActionButton variant="dark" />
                     </div>
                 </div>
            </BentoCard>

            {/* 5. Latest Payout Card */}
            <BentoCard variant="dark" className="flex flex-row items-center justify-start gap-4 p-6 md:p-8 min-h-[180px] md:col-start-1 md:row-start-3">
                 <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                   <HeartHandshake className="h-6 w-6 text-charity-accent shrink-0 stroke-[2]" />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-charity-accent mb-1">Latest Payout</p>
                    <h3 className="text-2xl font-serif leading-tight">${stats.latestPayoutAmount.toLocaleString()}</h3>
                 </div>
            </BentoCard>

            {/* 6. Education Image Card */}
            <BentoCard variant="image" className="md:row-span-2 md:col-start-3 md:row-start-2 p-0 min-h-[380px] group cursor-pointer overflow-hidden">
                 <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop" alt="Children smiling" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                 <div className="absolute inset-0 bg-[#062F23]/20 z-10"></div>
                 <div className="relative z-20 h-full flex flex-col justify-end p-6 md:p-8 text-white">
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest">
                        Education
                      </span>
                    </div>
                    <h3 className="text-xl font-serif leading-tight">
                      Transparent and verified impact
                    </h3>
                 </div>
            </BentoCard>

            {/* 7. Active Endpoints Card */}
            <BentoCard variant="dark" className="flex flex-row items-center justify-start gap-4 p-6 md:p-8 min-h-[180px] md:col-start-4 md:row-start-3">
                 <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                   <Heart className="h-6 w-6 text-charity-accent shrink-0 stroke-[2]" />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-charity-accent mb-1">Active Endpoints</p>
                    <h3 className="text-2xl font-serif leading-tight">{stats.walletsCount}</h3>
                 </div>
            </BentoCard>

          </div>
        </section>
      </div>

      {/* SECTION 2: How It Works & Footer Statement */}
      <div className="bg-[#FDFBF7] mt-8">
        {/* How It Works Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-charity-darker mb-6 tracking-tight">The Path to Verified Impact</h2>
            <p className="text-charity-darker/60 max-w-2xl mx-auto text-lg leading-relaxed">See how we bridge the trust gap in crypto philanthropy.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
             {/* Connecting Line (Desktop) */}
             <div className="hidden md:block absolute top-[48px] left-1/6 right-1/6 h-[2px] bg-gradient-to-r from-transparent via-charity-darker/10 to-transparent z-0"></div>

             {/* Step 1 */}
             <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-full shadow-sm border border-charity-darker/5 flex items-center justify-center mb-8 shrink-0 text-charity-darker">
                   <ShieldCheck className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif text-charity-darker mb-4">Rigorous Vetting & Application</h3>
                <p className="text-charity-darker/70 leading-relaxed mb-6">
                  Every project begins with a human review. Charities or coin creators apply to be listed. Our admins manually verify legitimacy and payment methods.
                </p>
                <div className="bg-charity-dark/5 px-5 py-3 rounded-xl inline-flex flex-col items-center gap-1 border border-charity-dark/10">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-charity-dark/60">Status</span>
                   <span className="text-sm font-medium text-charity-darker">Preventing fake claims before they happen.</span>
                </div>
             </div>

             {/* Step 2 */}
             <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-full shadow-sm border border-charity-darker/5 flex items-center justify-center mb-8 shrink-0 text-charity-darker">
                   <Link2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif text-charity-darker mb-4">Transparent Routing</h3>
                <p className="text-charity-darker/70 leading-relaxed mb-6">
                  Once approved, a dedicated Solana wallet is assigned and displayed publicly. This ensures funds are segregated and tracked from Day 1.
                </p>
                <div className="bg-charity-dark/5 px-5 py-3 rounded-xl inline-flex flex-col items-center gap-1 border border-charity-dark/10">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-charity-dark/60">Status</span>
                   <span className="text-sm font-medium text-charity-darker">On-chain tracking in real-time.</span>
                </div>
             </div>

             {/* Step 3 */}
             <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-full shadow-sm border border-charity-darker/5 flex items-center justify-center mb-8 shrink-0 text-charity-darker">
                   <FileCheck className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif text-charity-darker mb-4">Verified Distribution</h3>
                <p className="text-charity-darker/70 leading-relaxed mb-6">
                  When funds are distributed, we upload the Solana Transaction Hash and a Receipt. The community can see exactly when funds reached the charity.
                </p>
                <div className="bg-charity-dark/5 px-5 py-3 rounded-xl inline-flex flex-col items-center gap-1 border border-charity-dark/10">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-charity-dark/60">Status</span>
                   <span className="text-sm font-medium text-charity-darker">Proof-of-Relief for everyone to see.</span>
                </div>
             </div>
          </div>
        </section>

        {/* Footer Statement */}
        <section className="border-t border-charity-dark/10 bg-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-serif text-charity-darker leading-relaxed mb-4">
              <span className="font-bold">Ledgera:</span> Turning Solana&apos;s speed into real-world aid through manual accountability and on-chain proof.
            </h2>
            <p className="text-xl text-charity-dark font-medium uppercase tracking-widest">
              Don&apos;t just donate. Verify.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
