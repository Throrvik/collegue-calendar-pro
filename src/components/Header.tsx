import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logget ut",
      description: "Du er nå logget ut.",
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-card/80 border-b shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:scale-110 transition-transform shadow-glow">
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Turnuskalender
          </h1>
        </Link>
        <nav className="flex items-center gap-2 md:gap-4">
          <Link to="/om-oss">
            <Button variant="ghost" className="hover:bg-primary/10">Om oss</Button>
          </Link>
          <Link to="/kollegaer">
            <Button variant="ghost" className="hover:bg-primary/10">Kollegaer</Button>
          </Link>
          {user ? (
            <>
              <Link to="/profil">
                <Button variant="ghost" className="hover:bg-primary/10">Profil</Button>
              </Link>
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
                className="hover:bg-destructive/10 gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logg ut</span>
              </Button>
            </>
          ) : (
            <Link to="/innlogging">
              <Button className="bg-gradient-to-r from-primary to-accent">
                Logg inn
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
