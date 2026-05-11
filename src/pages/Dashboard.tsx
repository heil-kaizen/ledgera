import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Clock, CheckCircle, XCircle, FileText } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    archived: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }

    const fetchData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) {
          navigate("/login");
          return;
        }
        setUser(user);

        // Fetch application counts
        const { data: apps, error: appsError } = await supabase
          .from("charity_applications")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (appsError) throw appsError;

        setRecentApps(apps || []);

        const counts = (apps || []).reduce((acc, app) => {
          if (app.status === 'pending') acc.pending++;
          if (app.status === 'approved') acc.approved++;
          if (app.status === 'rejected') acc.rejected++;
          if (app.status === 'archived') acc.archived++;
          return acc;
        }, { pending: 0, approved: 0, rejected: 0, archived: 0 });

        setStats(counts);

      } catch (err: any) {
        console.error("Dashboard Error:", err);
        setError(err.message || "Failed to fetch dashboard data.");
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-serif text-charity-darker">Dashboard</h1>
        <Button variant="outline" onClick={async () => {
             await supabase.auth.signOut();
             window.location.href = '/';
        }}>Sign out</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8">
          <p className="font-semibold">Connection Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-charity-muted shadow-sm">
             <h3 className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-4">Pending Applications</h3>
             <p className="text-5xl font-serif text-charity-darker">{stats.pending}</p>
         </div>
         <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-charity-muted shadow-sm">
             <h3 className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-4">Approved Charities</h3>
             <p className="text-5xl font-serif text-charity-darker">{stats.approved}</p>
         </div>
         <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-charity-muted shadow-sm">
             <h3 className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-4">Rejected Applications</h3>
             <p className="text-5xl font-serif text-charity-darker">{stats.rejected}</p>
         </div>
         <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-charity-muted shadow-sm">
             <h3 className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-4 text-center md:text-left truncate">Archived Applications</h3>
             <p className="text-5xl font-serif text-charity-darker">{stats.archived}</p>
         </div>
      </div>
      
      <div className="mt-8 bg-white p-8 rounded-[2.5rem] border border-charity-muted shadow-sm">
         <h2 className="text-2xl font-serif text-charity-darker mb-6 flex items-center gap-2">
            <FileText className="h-5 w-5 opacity-50" />
            Recent Activity
         </h2>
         
         {recentApps.length === 0 ? (
           <p className="text-gray-500 italic">No recent activity to show.</p>
         ) : (
           <div className="space-y-4">
             {recentApps.slice(0, 5).map((app) => (
               <div key={app.id} className="flex items-center justify-between p-4 bg-charity-light/30 rounded-2xl border border-charity-muted">
                 <div>
                   <h3 className="font-semibold text-charity-darker text-lg">{app.charity_name}</h3>
                   <p className="text-sm text-gray-500">Submitted on {new Date(app.created_at).toLocaleDateString()}</p>
                 </div>
                 <div>
                   {app.status === 'pending' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-wider"><Clock className="h-3 w-3" /> Pending</span>}
                   {app.status === 'approved' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider"><CheckCircle className="h-3 w-3" /> Approved</span>}
                   {app.status === 'rejected' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider"><XCircle className="h-3 w-3" /> Rejected</span>}
                   {app.status === 'archived' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider"><FileText className="h-3 w-3" /> Archived</span>}
                 </div>
               </div>
             ))}
           </div>
         )}
      </div>
    </div>
  );
}
