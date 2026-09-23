import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground scanlines">
      <div className="max-w-md w-full p-8 border border-border bg-card rounded-sm text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-destructive" />
        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
        <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">Signal Lost</h1>
        <p className="text-muted-foreground font-mono text-sm mb-8">
          ERR 404: The requested investigation file could not be located in the database.
        </p>
        <Link 
          href="/"
          className="inline-block border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors px-6 py-3 font-mono text-sm uppercase font-bold tracking-wider"
        >
          Return to HQ
        </Link>
      </div>
    </div>
  );
}
