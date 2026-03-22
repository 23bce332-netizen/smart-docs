import {
  FileSearch,
  ShieldCheck,
  Bot,
  CalendarClock,
  FolderOpen,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "Smart AI Extraction",
    description: "Upload any receipt or warranty document and let AI instantly pull product name, date, and duration.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Cloud Storage",
    description: "All files are encrypted and stored securely. Access your documents from any device, any time.",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    description: "Ask natural-language questions like \"When does my laptop warranty expire?\" and get instant answers.",
  },
  {
    icon: CalendarClock,
    title: "Expiry Tracking & Alerts",
    description: "Automatic expiry calculation with customizable email reminders sent days before warranty ends.",
  },
  {
    icon: FolderOpen,
    title: "Document Management",
    description: "Search, filter, preview, and organize all your warranties and receipts in one clean dashboard.",
  },
  {
    icon: BarChart3,
    title: "Admin Analytics",
    description: "Admin panel with user stats, document counts, and active vs. expired warranty breakdown.",
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-24 sm:py-32">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center mb-16 animate-in-up">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Core features</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything you need to manage warranties</h2>
        <p className="mt-4 text-muted-foreground text-lg">
          From AI-powered extraction to smart reminders — DocVault handles the heavy lifting.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="group relative p-6 rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/20 animate-in-up"
            style={{ animationDelay: `${i * 80 + 80}ms` }}
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold mb-1.5">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
