import { LayoutGrid, ShoppingBag, Landmark, Zap, ShieldCheck, HeartPulse, GraduationCap, Plane, Car, PhoneCall, Globe, TrendingUp } from 'lucide-react';

const SERVICES = [
    {
        category: "Financial Ecosystem",
        items: [
            { title: "Coop Insurance", description: "Health & Asset coverage at community rates.", icon: <ShieldCheck className="w-6 h-6" />, color: "bg-blue-500", premium: true },
            { title: "Micro-Investment", description: "Collective investment in real estate & stocks.", icon: <TrendingUp className="w-6 h-6" />, color: "bg-green-500", premium: true },
            { title: "Bill Payments", description: "Pay utilities directly from your coop wallet.", icon: <Zap className="w-6 h-6" />, color: "bg-yellow-500" },
        ]
    },
    {
        category: "Marketplace & Lifestyle",
        items: [
            { title: "Member Market", description: "Buy and sell items within the community.", icon: <ShoppingBag className="w-6 h-6" />, color: "bg-pink-500" },
            { title: "Health Fund", description: "Emergency medical support for verified members.", icon: <HeartPulse className="w-6 h-6" />, color: "bg-red-500" },
            { title: "Scholarship Portal", description: "Educational grants for member dependents.", icon: <GraduationCap className="w-6 h-6" />, color: "bg-indigo-500", premium: true },
        ]
    },
    {
        category: "Logistics & Utility",
        items: [
            { title: "Travel Portal", description: "Book flights and hotels with coop discounts.", icon: <Plane className="w-6 h-6" />, color: "bg-cyan-500" },
            { title: "Auto Lease", description: "Access community vehicle leasing programs.", icon: <Car className="w-6 h-6" />, color: "bg-slate-700", premium: true },
            { title: "Global Transfer", description: "Send money to other cooperatives worldwide.", icon: <Globe className="w-6 h-6" />, color: "bg-purple-500" },
        ]
    }
];

export default function ServicesPage() {
    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Discover Services</h1>
                    <p className="text-slate-500 font-medium">Beyond savings: Unlock the full power of your cooperative membership.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 flex items-center gap-2 shadow-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Ecosystem</span>
                </div>
            </div>

            {SERVICES.map((section, idx) => (
                <div key={idx} className="space-y-6">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{section.category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {section.items.map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-cyan-200 transition-all group cursor-pointer relative overflow-hidden">
                                {item.premium && (
                                    <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border border-amber-200">
                                        Premium
                                    </div>
                                )}
                                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.description}</p>
                                
                                <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-cyan-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                    Launch Service &rarr;
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Coming Soon Teaser */}
            <div className="bg-slate-900 rounded-[3rem] p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />
                
                <LayoutGrid className="w-12 h-12 text-cyan-500 mx-auto mb-6 opacity-50" />
                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">More coming every month</h2>
                <p className="text-slate-400 max-w-md mx-auto text-sm font-medium leading-relaxed">
                    Our cooperative committee is constantly negotiating better deals and services for our members. 
                    Stay tuned for more utility integrations.
                </p>
                <button className="mt-8 px-8 py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-cyan-50 transition-all text-xs uppercase tracking-widest">
                    Request a Service
                </button>
            </div>
        </div>
    );
}
