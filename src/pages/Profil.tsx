import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import CookieBanner from "@/components/CookieBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, LogIn, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Profil = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        <CookieBanner />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-muted-foreground">Laster...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        <CookieBanner />
        
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="p-12 text-center">
              <User className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
              <h1 className="text-3xl font-bold mb-4">Min profil</h1>
              <p className="text-muted-foreground mb-8">
                Du må være innlogget for å se din profil
              </p>
              <Link to="/innlogging">
                <Button size="lg" className="gap-2">
                  <LogIn className="h-5 w-5" />
                  Logg inn
                </Button>
              </Link>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <CookieBanner />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Min profil</h1>
                <p className="text-muted-foreground">Administrer kontoen din</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">E-post</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h2 className="text-xl font-semibold mb-4">Kontoinformasjon</h2>
                <p className="text-muted-foreground">
                  Bruker-ID: <span className="font-mono text-sm">{user.id}</span>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profil;
