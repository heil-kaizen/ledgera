import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Menu, X, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function Header() {
  const [session, setSession] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navLinkClass = (path: string) => 
    cn(
      "transition-all duration-200 font-medium",
      location.pathname === path 
        ? "text-charity-dark" 
        : "text-charity-dark/50 hover:text-charity-dark"
    );

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="py-6 px-4 md:px-8 w-full z-50 sticky top-0 flex items-center justify-between mb-10 bg-white/80 backdrop-blur-md">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
            <img 
               src="https://raw.githubusercontent.com/heil-kaizen/ledgera/main/assests/Ledgera.webp" 
               alt="Ledgera Logo" 
               className="w-8 h-8 object-contain" 
            />
            <span className="text-2xl font-bold font-serif tracking-tight text-charity-darker">Ledgera</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex bg-white/50 backdrop-blur-sm border border-charity-darker/10 rounded-full px-8 py-2 gap-10 text-sm">
            <Link to="/" className={navLinkClass("/")}>Home</Link>
            <Link to="/apply" className={navLinkClass("/apply")}>Apply</Link>
            {session && (
              <Link to="/admin" className={cn(navLinkClass("/admin"), "flex items-center gap-1.5")}>
                <ShieldCheck className="h-4 w-4" /> Admin
              </Link>
            )}
            <Link to="/about" className={navLinkClass("/about")}>About</Link>
            <Link to="/transparency" className={navLinkClass("/transparency")}>Transparency</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
            {session ? (
               <>
                 <Link to="/dashboard" className="bg-charity-dark text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">Dashboard</Link>
                 <button 
                   onClick={async () => {
                     await supabase.auth.signOut();
                     window.location.href = '/';
                   }} 
                   className="text-charity-dark px-4 py-3 rounded-full text-sm font-semibold hover:bg-charity-dark/5 transition-colors"
                 >
                   Sign Out
                 </button>
               </>
            ) : (
               <Link to="/login" className="bg-charity-dark text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">Login</Link>
            )}
        </div>
        
        {/* Mobile Nav Trigger */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-charity-dark"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-[80px] left-0 w-full bg-white border-b border-charity-darker/10 shadow-lg md:hidden flex flex-col p-6 gap-6">
            <Link to="/" onClick={closeMobileMenu} className={navLinkClass("/")}>Home</Link>
            <Link to="/apply" onClick={closeMobileMenu} className={navLinkClass("/apply")}>Apply</Link>
            {session && (
              <Link to="/admin" onClick={closeMobileMenu} className={cn(navLinkClass("/admin"), "flex items-center gap-1.5")}>
                <ShieldCheck className="h-4 w-4" /> Admin
              </Link>
            )}
            <Link to="/about" onClick={closeMobileMenu} className={navLinkClass("/about")}>About</Link>
            <Link to="/transparency" onClick={closeMobileMenu} className={navLinkClass("/transparency")}>Transparency</Link>
            
            <hr className="border-charity-darker/10" />
            
            <div className="flex flex-col gap-4">
              {session ? (
                <>
                  <Link to="/dashboard" onClick={closeMobileMenu} className="bg-charity-dark text-white px-6 py-3 rounded-full text-sm font-semibold text-center">Dashboard</Link>
                  <button 
                    onClick={async () => {
                      closeMobileMenu();
                      await supabase.auth.signOut();
                      window.location.href = '/';
                    }} 
                    className="text-charity-dark px-4 py-3 rounded-full text-sm font-semibold text-center border border-charity-dark/20"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={closeMobileMenu} className="bg-charity-dark text-white px-6 py-3 rounded-full text-sm font-semibold text-center">Login</Link>
              )}
            </div>
          </div>
        )}
    </header>
  );
}
