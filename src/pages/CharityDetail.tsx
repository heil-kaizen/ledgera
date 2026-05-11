import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Globe, 
  ShieldCheck, 
  Wallet, 
  ExternalLink,
  Receipt,
  FileText,
  Clock,
  ChevronRight,
  TrendingUp,
  Image as ImageIcon
} from "lucide-react";

interface Charity {
  id: string;
  charity_name: string;
  description: string;
  website: string;
  contact_email: string;
  status: string;
}

interface CharityWallet {
  id: string;
  blockchain: string;
  address: string;
  label: string;
}

interface PayoutProof {
  id: string;
  tx_hash: string;
  amount_crypto: number;
  amount_usd: number;
  description: string;
  evidence_url: string;
  created_at: string;
}

export default function CharityDetail() {
  const { id } = useParams<{ id: string }>();
  const [charity, setCharity] = useState<Charity | null>(null);
  const [wallets, setWallets] = useState<CharityWallet[]>([]);
  const [proofs, setProofs] = useState<PayoutProof[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !isSupabaseConfigured) return;

    const fetchDetails = async () => {
      try {
        const { data: charityData } = await supabase
          .from("charity_applications")
          .select("*")
          .eq("id", id)
          .single();

        const { data: walletData } = await supabase
          .from("charity_wallets")
          .select("*")
          .eq("charity_id", id);

        const { data: proofData } = await supabase
          .from("payout_proofs")
          .select("*")
          .eq("wallet_id", walletData?.length ? walletData[0].id : "") // Simplified logic for demo
          .order("created_at", { ascending: false });

        setCharity(charityData);
        setWallets(walletData || []);
        setProofs(proofData || []);
      } catch (err) {
        console.error("Detail fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) return (
    <div className="flex h-[70vh] items-center justify-center">
      <div className="w-8 h-8 border-2 border-charity-dark border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!charity) return (
    <div className="text-center py-20 font-serif">
      <h2 className="text-2xl text-charity-darker">Charity not found.</h2>
      <Link to="/transparency" className="text-charity-dark underline mt-4 inline-block">Back to directory</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 font-sans">
      <Link to="/transparency" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-charity-darker mb-10 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to transparency hub
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Info & Wallets */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white border border-charity-darker/5 p-10 rounded-[2.5rem]">
              <div className="bg-charity-light h-20 w-20 rounded-3xl flex items-center justify-center mb-8">
                <Globe className="h-10 w-10 text-charity-dark opacity-30" />
              </div>
              <h1 className="text-4xl font-serif text-charity-darker mb-4 leading-tight">{charity.charity_name}</h1>
              <div className={`flex items-center gap-2 font-semibold text-sm mb-6 ${charity.status === 'pending' ? 'text-yellow-700' : 'text-charity-dark'}`}>
                <ShieldCheck className="h-5 w-5" />
                {charity.status === 'pending' ? 'Pending Verification' : 'Verified Non-Profit'}
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                {charity.description}
              </p>
              <a 
                href={charity.website} 
                target="_blank" 
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 h-14 bg-charity-light text-charity-darker font-bold text-sm rounded-2xl hover:bg-charity-accent/10 transition-all border border-charity-darker/5"
              >
                Visit official website <ExternalLink className="h-4 w-4" />
              </a>
           </div>

           <div className="bg-charity-dark text-white p-10 rounded-[2.5rem] shadow-xl">
              <h3 className="text-xl font-serif mb-6 flex items-center gap-3">
                <Wallet className="h-6 w-6 text-charity-accent" /> Verified Wallets
              </h3>
              <p className="text-xs text-gray-400 mb-8 leading-relaxed italic">
                Only donate to these verified addresses. Donations to other wallets are not tracked by Ledgera.
              </p>
              <div className="space-y-4">
                 {wallets.length === 0 ? (
                   <p className="text-sm opacity-50 italic">No wallets assigned yet.</p>
                 ) : wallets.map(wallet => (
                   <div key={wallet.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl group transition-all hover:bg-white/10">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{wallet.blockchain}</span>
                         <span className="text-[10px] bg-charity-accent text-charity-darker px-2 py-0.5 rounded font-bold uppercase">{wallet.label}</span>
                      </div>
                      <p className="text-xs font-mono break-all opacity-80 leading-relaxed tracking-wider mb-3">{wallet.address}</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(wallet.address);
                          toast.success("Address copied!");
                        }}
                        className="text-[10px] font-bold uppercase tracking-widest text-charity-accent/80 hover:text-charity-accent transition-colors"
                      >
                        Copy Address
                      </button>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Column: Impact Timeline */}
        <div className="lg:col-span-2 space-y-10">
           <div className="flex items-center justify-between">
              <h2 className="text-3xl font-serif text-charity-darker flex items-center gap-3">
                 <TrendingUp className="h-7 w-7 text-charity-dark" /> Impact Timeline
              </h2>
              <div className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Proof of Payout</div>
           </div>

           <div className="space-y-6">
              {proofs.length === 0 ? (
                <div className="bg-white/50 border border-dashed border-charity-darker/10 p-20 rounded-[2.5rem] text-center">
                   <Receipt className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                   <p className="font-serif text-gray-500">No payout proofs documented yet.</p>
                </div>
              ) : proofs.map((proof, idx) => (
                <div key={proof.id} className="relative pl-12 group">
                   {/* Timeline line */}
                   {idx !== proofs.length - 1 && (
                     <div className="absolute left-[13px] top-6 bottom-[-24px] w-[2px] bg-charity-dark opacity-5"></div>
                   )}
                   
                   {/* Timeline dot */}
                   <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-charity-dark flex items-center justify-center p-1.5 transition-transform group-hover:scale-125 z-10">
                      <ShieldCheck className="text-charity-accent w-full h-full" />
                   </div>

                   <div className="bg-white border border-charity-darker/5 p-8 md:p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500">
                      <div className="flex flex-wrap justify-between items-start mb-6 gap-4">
                         <div>
                            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.15em] text-charity-darker/40 mb-2">
                               <Clock className="h-3 w-3" />
                               {new Date(proof.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <h3 className="text-2xl font-serif text-charity-darker leading-tight">{proof.description}</h3>
                         </div>
                         <div className="bg-charity-light px-5 py-3 rounded-2xl border border-charity-darker/5 text-center min-w-[120px]">
                            <span className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Impact Value</span>
                            <span className="text-xl font-serif text-charity-darker">${proof.amount_usd.toLocaleString()}</span>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                         <div className="space-y-4">
                            <div className="space-y-1">
                               <span className="text-[10px] font-bold uppercase tracking-widest text-charity-darker/30">Transaction Link</span>
                               <a 
                                href={proof.tx_hash.startsWith('http') ? proof.tx_hash : `https://solscan.io/tx/${proof.tx_hash}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-2 text-xs font-mono text-charity-dark hover:underline truncate"
                               >
                                  View on Solscan <ExternalLink className="h-3 w-3" />
                               </a>
                            </div>
                            {proof.evidence_url && (
                              <a 
                                href={proof.evidence_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 h-10 px-4 bg-charity-accent text-charity-darker text-[10px] font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-all"
                              >
                                View File Evidence <FileText className="h-3.5 w-3.5" />
                              </a>
                            )}
                         </div>
                         
                         {/* Visual Proof Preview Placeholder */}
                         <div className="h-40 bg-charity-light rounded-3xl flex items-center justify-center p-6 border border-charity-darker/5 overflow-hidden">
                            {proof.evidence_url && proof.evidence_url.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                              <img src={proof.evidence_url} alt="Impact" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <div className="text-center italic opacity-20">
                                <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Image Evidence Attached</span>
                              </div>
                            )}
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
