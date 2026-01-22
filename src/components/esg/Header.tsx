import { Leaf } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border bg-card shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg esg-gradient">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              ESG Materiality Assessment
            </h1>
            <p className="text-sm text-muted-foreground">
              Identify and prioritize your sustainability topics
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
