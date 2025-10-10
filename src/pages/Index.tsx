import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import CookieBanner from "@/components/CookieBanner";
import CalendarGrid from "@/components/Calendar/CalendarGrid";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar as CalendarIcon, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const scrollToManualSchedule = () => {
    const element = document.getElementById("manual-schedule-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <CookieBanner />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in">
            Din Smarte Turnuskalender
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Få full oversikt over turnuser, samarbeid med kollegaer og smart planlegging
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-8 hover:shadow-large transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-glow">
                <CalendarIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Mine Turnuser</h3>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Hold oversikt over alle dine arbeidsskift og planlegg framover
            </p>
            <Button 
              size="lg" 
              onClick={scrollToManualSchedule}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-md"
            >
              Legg til turnus
            </Button>
          </Card>

          <Card className="p-8 hover:shadow-large transition-all duration-300 hover:-translate-y-1 border-2 hover:border-accent/20 bg-gradient-to-br from-card to-accent/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold">Kollegaer</h3>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Se kollegaenes turnuser og planlegg felles aktiviteter
            </p>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate("/kollegaer")}
              className="w-full hover:bg-accent/10 transition-all border-2"
            >
              Finn kollegaer
            </Button>
          </Card>

          {user && (
            <Card className="p-8 hover:shadow-large transition-all duration-300 hover:-translate-y-1 border-2 hover:border-shift-blue/20 bg-gradient-to-br from-card to-shift-blue/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-shift-blue/20 to-shift-blue/10">
                  <Bell className="h-6 w-6 text-shift-blue" />
                </div>
                <h3 className="text-xl font-bold">Varsler</h3>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Administrer e-postvarsler for kollegaforespørsler
              </p>
              <Button variant="outline" size="lg" className="w-full hover:bg-shift-blue/10 transition-all border-2">
                Innstillinger
              </Button>
            </Card>
          )}
        </div>

        <CalendarGrid />
      </main>
    </div>
  );
};

export default Index;
