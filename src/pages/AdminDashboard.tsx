import React, { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Wallet, 
  Receipt, 
  FileText,
  User,
  ShieldCheck,
  ChevronRight,
  Globe
} from "lucide-react";

interface Application {
  id: string;
  charity_name: string;
  description: string;
  website: string;
  contact_email: string;
  logo_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  admin_notes: string;
  created_at: string;
  user_id: string;
}

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newNote, setNewNote] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [blockchain] = useState("solana");
  
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [payoutAmountUsd, setPayoutAmountUsd] = useState("");
  const [payoutTxHash, setPayoutTxHash] = useState("");
  const [payoutDescription, setPayoutDescription] = useState("");
  const [payoutFile, setPayoutFile] = useState<File | null>(null);
  const [submittingPayout, setSubmittingPayout] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }

        const { data: adminRecord } = await supabase
          .from("admins")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (!adminRecord) {
          toast.error("Access denied. Admin privileges required.");
          navigate("/");
          return;
        }

        setIsAdmin(true);
        fetchApplications();
      } catch (err) {
        console.error("Admin check error:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("charity_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch applications");
    } else {
      setApplications(data || []);
    }
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected' | 'archived') => {
    const { error } = await supabase
      .from("charity_applications")
      .update({ status, admin_notes: newNote })
      .eq("id", id);

    if (error) {
      toast.error("Update failed: " + error.message);
    } else {
      toast.success(`Application ${status}`);
      fetchApplications();
      if (selectedApp?.id === id) {
        setSelectedApp({ ...selectedApp, status, admin_notes: newNote });
      }
    }
  };

  const fetchWallets = async (charityId: string) => {
    const { data } = await supabase.from('charity_wallets').select('*').eq('charity_id', charityId);
    if (data) {
      setWallets(data);
      if (data.length > 0) setSelectedWalletId(data[0].id);
    }
  };

  useEffect(() => {
    if (selectedApp && selectedApp.status === 'approved') {
      fetchWallets(selectedApp.id);
    } else {
      setWallets([]);
      setSelectedWalletId("");
    }
  }, [selectedApp]);

  const addWalletAddress = async () => {
    if (!selectedApp || !walletAddress) return;

    const { error } = await supabase
      .from("charity_wallets")
      .insert({
        charity_id: selectedApp.id,
        blockchain,
        address: walletAddress,
        label: "Primary Donation Wallet"
      });

    if (error) {
      toast.error("Failed to add wallet: " + error.message);
    } else {
      toast.success("Wallet address assigned");
      setWalletAddress("");
      fetchWallets(selectedApp.id);
    }
  };

  const deleteWallet = async (walletId: string) => {
    if (!selectedApp) return;
    const { error } = await supabase.from('charity_wallets').delete().eq('id', walletId);
    if (error) {
      toast.error("Failed to remove wallet: " + error.message);
    } else {
      toast.success("Wallet removed");
      fetchWallets(selectedApp.id);
    }
  };

  const handlePayoutSubmit = async () => {
    if (!selectedWalletId || !payoutAmountUsd || !payoutTxHash || !payoutDescription) {
        toast.error("Please fill in all required fields.");
        return;
    }

    setSubmittingPayout(true);
    try {
        let evidenceUrl = null;
        if (payoutFile) {
            const fileName = `${Date.now()}_${payoutFile.name.replace(/[^a-zA-Z0-9.\-]/g, '_')}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('proofs')
                .upload(fileName, payoutFile);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('proofs')
                .getPublicUrl(fileName);
            
            evidenceUrl = urlData.publicUrl;
        }

        const { error: insertError } = await supabase
            .from('payout_proofs')
            .insert({
                wallet_id: selectedWalletId,
                tx_hash: payoutTxHash,
                amount_crypto: 0,
                amount_usd: Number(payoutAmountUsd),
                description: payoutDescription,
                evidence_url: evidenceUrl
            });

        if (insertError) throw insertError;

        toast.success("Payout proof logged successfully!");
        setPayoutAmountUsd("");
        setPayoutTxHash("");
        setPayoutDescription("");
        setPayoutFile(null);
    } catch (e: any) {
        toast.error("Failed to submit payout: " + e.message);
    } finally {
        setSubmittingPayout(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-charity-dark border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const stats = applications.reduce((acc, app) => {
    if (app.status === 'pending') acc.pending++;
    if (app.status === 'approved') acc.approved++;
    if (app.status === 'rejected') acc.rejected++;
    if (app.status === 'archived') acc.archived++;
    return acc;
  }, { pending: 0, approved: 0, rejected: 0, archived: 0 });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-serif text-charity-darker mb-2">Review Panel</h1>
          <p className="text-gray-500 font-sans">Manage charity verifications and blockchain infrastructure.</p>
        </div>
        <div className="flex items-center gap-2 bg-charity-accent/10 px-4 py-2 rounded-full border border-charity-accent/20">
          <ShieldCheck className="h-5 w-5 text-charity-dark" />
          <span className="text-sm font-semibold text-charity-dark">Admin Access</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
         <div className="bg-white p-6 rounded-3xl border border-charity-muted shadow-sm">
             <h3 className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-2">Pending</h3>
             <p className="text-3xl font-serif text-charity-darker">{stats.pending}</p>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-charity-muted shadow-sm">
             <h3 className="text-green-500 font-bold uppercase tracking-widest text-[10px] mb-2">Approved</h3>
             <p className="text-3xl font-serif text-charity-darker">{stats.approved}</p>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-charity-muted shadow-sm">
             <h3 className="text-red-500 font-bold uppercase tracking-widest text-[10px] mb-2">Rejected</h3>
             <p className="text-3xl font-serif text-charity-darker">{stats.rejected}</p>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-charity-muted shadow-sm flex flex-col justify-between">
             <h3 className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-2 text-center md:text-left truncate">Archived</h3>
             <p className="text-3xl font-serif text-charity-darker">{stats.archived}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Applications List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-serif text-charity-darker mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" /> Applications
          </h2>
          {applications.length === 0 ? (
            <p className="text-gray-500 text-sm italic p-8 bg-white rounded-3xl border border-charity-muted text-center">
              No applications found.
            </p>
          ) : (
            applications.map((app) => (
              <div 
                key={app.id}
                onClick={() => {
                  setSelectedApp(app);
                  setNewNote(app.admin_notes || "");
                }}
                className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                  selectedApp?.id === app.id 
                  ? "bg-charity-dark text-white border-charity-dark" 
                  : "bg-white border-charity-muted hover:border-charity-dark"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold truncate pr-2">{app.charity_name}</h3>
                  <StatusBadge status={app.status} inverse={selectedApp?.id === app.id} />
                </div>
                <div className="flex items-center gap-2 text-xs opacity-70">
                  <User className="h-3 w-3" />
                  <span>{new Date(app.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Application Details */}
        <div className="lg:col-span-2">
          {selectedApp ? (
            <div className="bg-white rounded-[2.5rem] border border-charity-muted p-8 md:p-10 shadow-sm sticky top-24">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  {selectedApp.logo_url ? (
                    <img src={selectedApp.logo_url} alt="Logo" className="w-16 h-16 rounded-2xl object-cover border border-charity-muted" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-charity-light flex items-center justify-center border border-charity-muted">
                       <Globe className="h-8 w-8 text-charity-dark opacity-20" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-3xl font-serif text-charity-darker">{selectedApp.charity_name}</h2>
                    <a href={selectedApp.website} target="_blank" rel="noreferrer" className="text-charity-dark flex items-center gap-1.5 text-sm hover:underline mt-1 font-medium">
                      {selectedApp.website} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                <StatusBadge status={selectedApp.status} size="lg" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-4">
                  <div className="bg-charity-light/50 p-6 rounded-3xl">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-charity-dark/60 mb-2">Contact</h4>
                    <p className="text-charity-darker font-medium">{selectedApp.contact_email}</p>
                  </div>
                  <div className="bg-charity-light/50 p-6 rounded-3xl">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-charity-dark/60 mb-2">Submitted On</h4>
                    <p className="text-charity-darker font-medium">{new Date(selectedApp.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-charity-light/50 p-6 rounded-3xl overflow-y-auto max-h-[160px]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-charity-dark/60 mb-2">Description</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedApp.description || "No description provided."}</p>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="space-y-8 border-t border-charity-muted pt-8">
                
                {/* Notes */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-charity-darker">Reviewer Notes</label>
                  <textarea 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full p-5 bg-charity-light/30 border border-charity-muted rounded-2xl outline-none focus:border-charity-dark transition-all text-sm"
                    placeholder="Add notes about verification findings..."
                    rows={3}
                  />
                </div>

                {/* Status Controls */}
                <div className="flex flex-wrap gap-4">
                  {selectedApp.status === 'pending' && (
                    <>
                      <Button 
                        variant="dark" 
                        className="flex-1 rounded-2xl h-14"
                        onClick={() => updateStatus(selectedApp.id, 'approved')}
                      >
                        <CheckCircle className="h-5 w-5 mr-2" /> Approve Application
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 rounded-2xl h-14 border-red-100 text-red-600 hover:bg-red-50"
                        onClick={() => updateStatus(selectedApp.id, 'rejected')}
                      >
                        <XCircle className="h-5 w-5 mr-2" /> Reject
                      </Button>
                    </>
                  )}
                  {selectedApp.status === 'approved' && (
                    <Button 
                      variant="outline" 
                      className="w-full rounded-2xl h-14 border-gray-200 text-gray-600 hover:bg-gray-50"
                      onClick={() => updateStatus(selectedApp.id, 'archived')}
                    >
                      Archive Project
                    </Button>
                  )}
                  {selectedApp.status === 'archived' && (
                     <div className="w-full flex gap-4">
                        <Button 
                          variant="outline" 
                          className="w-full rounded-2xl h-14 border-gray-200 text-gray-600 hover:bg-gray-50"
                          onClick={() => updateStatus(selectedApp.id, 'approved')}
                        >
                          Unarchive Project
                        </Button>
                     </div>
                  )}
                </div>

                {/* Infrastructure Controls (Only if approved) */}
                {selectedApp.status === 'approved' && (
                  <div className="bg-charity-accent/5 p-8 rounded-3xl border border-charity-accent/20 space-y-6">
                    <h3 className="font-serif text-xl text-charity-darker flex items-center gap-2">
                       <Wallet className="h-5 w-5" /> Wallet Infrastructure
                    </h3>
                    
                    {wallets.length > 0 && (
                      <div className="space-y-2 mb-6">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-charity-dark/60 mb-2">Assigned Wallets</h4>
                        {wallets.map(w => (
                          <div key={w.id} className="flex justify-between items-center text-sm bg-white border border-charity-muted px-4 py-3 rounded-xl">
                            <span className="font-mono text-gray-600 truncate mr-4">{w.address}</span>
                            <button 
                              onClick={() => deleteWallet(w.id)}
                              className="text-red-500 hover:text-red-700 font-semibold uppercase text-xs tracking-wider shrink-0"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-charity-light/50 border border-charity-accent/30 rounded-xl px-4 py-3 text-gray-500 font-semibold text-center cursor-not-allowed">
                        Solana
                      </div>
                      <input 
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder="Wallet Address (0x...)"
                        className="md:col-span-2 bg-white border border-charity-accent/30 rounded-xl px-4 py-3 outline-none"
                      />
                    </div>
                    <Button 
                      variant="accent" 
                      className="w-full rounded-xl"
                      disabled={!walletAddress}
                      onClick={addWalletAddress}
                    >
                      Assign Donation Wallet
                    </Button>
                  </div>
                )}

                {/* Payout Proof Form (Only if approved) */}
                {selectedApp.status === 'approved' && (
                  <div className="bg-charity-light/50 p-8 rounded-3xl border border-charity-muted space-y-6">
                    <h3 className="font-serif text-xl text-charity-darker flex items-center gap-2">
                       <Receipt className="h-5 w-5" /> Log Payout Proof
                    </h3>
                    
                    <div className="space-y-4">
                      {wallets.length === 0 ? (
                        <p className="text-sm text-gray-500">Assign a wallet first to log payouts.</p>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-charity-dark/60 mb-2">Wallet</label>
                                <select 
                                  value={selectedWalletId}
                                  onChange={(e) => setSelectedWalletId(e.target.value)}
                                  className="w-full bg-white border border-charity-muted rounded-xl px-4 py-3 outline-none focus:border-charity-dark text-sm"
                                >
                                  {wallets.map(w => (
                                    <option key={w.id} value={w.id}>{w.label} ({w.blockchain}) - {w.address.slice(0,6)}...{w.address.slice(-4)}</option>
                                  ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-charity-dark/60 mb-2">Amount (USD)</label>
                                <input 
                                  type="number"
                                  value={payoutAmountUsd}
                                  onChange={(e) => setPayoutAmountUsd(e.target.value)}
                                  placeholder="e.g., 5000"
                                  className="w-full bg-white border border-charity-muted rounded-xl px-4 py-3 outline-none focus:border-charity-dark text-sm"
                                />
                            </div>
                          </div>
                          
                          <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-charity-dark/60 mb-2">Transaction Link (Solscan)</label>
                              <input 
                                type="text"
                                value={payoutTxHash}
                                onChange={(e) => setPayoutTxHash(e.target.value)}
                                placeholder="https://solscan.io/tx/..."
                                className="w-full bg-white border border-charity-muted rounded-xl px-4 py-3 outline-none focus:border-charity-dark text-sm"
                              />
                          </div>
                          
                          <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-charity-dark/60 mb-2">Description</label>
                              <textarea 
                                value={payoutDescription}
                                onChange={(e) => setPayoutDescription(e.target.value)}
                                placeholder="e.g., Purchased 500 blankets for earthquake victims"
                                rows={2}
                                className="w-full bg-white border border-charity-muted rounded-xl px-4 py-3 outline-none focus:border-charity-dark text-sm"
                              />
                          </div>

                          <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-charity-dark/60 mb-2">Proof Evidence</label>
                              <input 
                                type="file"
                                onChange={(e) => setPayoutFile(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-charity-dark file:text-white
                                  hover:file:bg-charity-dark/90"
                              />
                          </div>
                          
                          <Button 
                            variant="dark" 
                            className="w-full rounded-xl mt-2"
                            disabled={submittingPayout || !selectedWalletId}
                            onClick={handlePayoutSubmit}
                          >
                            {submittingPayout ? "Submitting..." : "Submit Payout"}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white border border-dashed border-charity-muted rounded-[2.5rem] p-20 text-center text-gray-400">
               <FileText className="h-16 w-16 mb-4 opacity-20" />
               <p className="text-lg font-serif">Select an application to begin review</p>
               <p className="text-sm max-w-xs mt-2">Verification details, contact info, and infrastructure controls will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, size = "md", inverse = false }: { status: string, size?: "md" | "lg", inverse?: boolean }) {
  const styles = {
    pending: inverse ? "bg-white/20 text-white border-white/30" : "bg-yellow-50 text-yellow-700 border-yellow-100",
    approved: "bg-green-50 text-green-700 border-green-100",
    rejected: "bg-red-50 text-red-700 border-red-100",
    archived: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const badgeSize = size === "lg" ? "px-4 py-1.5 text-sm" : "px-2.5 py-1 text-[10px]";

  return (
    <span className={`inline-flex items-center uppercase font-bold tracking-widest rounded-full border ${styles[status as keyof typeof styles]} ${badgeSize}`}>
      {status === 'pending' && <Clock className="h-3 w-3 mr-1.5" />}
      {status === 'approved' && <CheckCircle className="h-3 w-3 mr-1.5" />}
      {status === 'rejected' && <XCircle className="h-3 w-3 mr-1.5" />}
      {status === 'archived' && <FileText className="h-3 w-3 mr-1.5" />}
      {status}
    </span>
  );
}
