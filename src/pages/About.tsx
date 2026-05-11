import { ShieldCheck, Link as LinkIcon, FileCheck } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen pb-20 fade-in">
      <div className="max-w-4xl mx-auto px-4 md:px-8 mt-12 mb-20">
        
        <header className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-charity-dark/5 rounded-full text-charity-dark font-semibold text-sm mb-6">
            <ShieldCheck className="h-4 w-4" />
            <span>About Ledgera</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-charity-darker leading-tight mb-6">
            Bridging the Trust Gap in Crypto Philanthropy
          </h1>
        </header>

        <div className="prose prose-lg max-w-none text-charity-darker/80 leading-relaxed space-y-8">
          <p className="text-xl">
            Ledgera was founded to solve the &quot;Last Mile&quot; problem in the Solana ecosystem. While the Pump.fun and memecoin communities have an incredible capacity for generosity, that impact is often lost in a &quot;Black Box&quot; of automated routing and invisible distribution.
          </p>

          <p className="text-xl">
            In an ecosystem defined by speed and anonymity, Ledgera provides the missing layer of accountability. We don&apos;t just route funds; we ledger impact. Our platform bridges the gap between high-speed memecoin innovation and verified traditional relief, ensuring every transaction is a matter of public record.
          </p>

          <p className="text-xl">
            Millions are raised, but the question remains: <strong className="text-charity-darker">Where did the money go?</strong>
          </p>

          <div className="bg-white rounded-3xl p-8 md:p-12 border border-charity-darker/10 shadow-sm my-16 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-charity-dark/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
             
             <h2 className="text-3xl font-serif text-charity-darker mb-6 relative z-10">Our Philosophy: Manual Accountability</h2>
             <p className="relative z-10">
               We believe that transparency isn&apos;t just a line of code; it&apos;s a commitment. Ledgera serves as a public transparency layer that turns on-chain donations into real-world relief. We don&apos;t hide behind &quot;coming soon&quot; automated claims. We manually verify every charity, manage secure donation endpoints, and provide public proof for every dollar distributed.
             </p>
          </div>

          <h2 className="text-3xl font-serif text-charity-darker mt-16 mb-8">Why Ledgera?</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-charity-light p-6 rounded-2xl">
              <h3 className="font-bold text-lg text-charity-darker mb-3 uppercase tracking-tight">For Donors</h3>
              <p className="text-sm">You get a verifiable audit trail from the moment fees are routed to the moment a charity receives the funds.</p>
            </div>
            
            <div className="bg-charity-light p-6 rounded-2xl">
              <h3 className="font-bold text-lg text-charity-darker mb-3 uppercase tracking-tight">For Charities</h3>
              <p className="text-sm">Organizations can receive the life-changing benefits of crypto-funding without needing to manage private keys or navigate complex exchanges.</p>
            </div>
            
            <div className="bg-charity-light p-6 rounded-2xl">
              <h3 className="font-bold text-lg text-charity-darker mb-3 uppercase tracking-tight">For the Community</h3>
              <p className="text-sm">We provide the &quot;Relief&quot; of knowing that your project&apos;s generosity actually reached its destination.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
