import Header from "@/components/Header";
import CookieBanner from "@/components/CookieBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Share2, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const OmOss = () => {
  const features = [
    {
      icon: Calendar,
      title: "Turnusplanlegging",
      description: "Enkelt å holde oversikt over din og kollegaenes turnuser",
    },
    {
      icon: Users,
      title: "Kollegadeling",
      description: "Del kalenderen din og se når kollegaene dine jobber",
    },
    {
      icon: Share2,
      title: "Inviter andre",
      description: "Send lenke eller QR-kode til nye kollegaer",
    },
    {
      icon: Bell,
      title: "Varsler",
      description: "Få beskjed om endringer i turnuser og kollegaforespørsler",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CookieBanner />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Om TurnusKalender
            </h1>
            <p className="text-xl text-muted-foreground">
              Gjør turnusplanlegging enklere for deg og dine kollegaer
            </p>
          </div>

          <Card className="p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4">Vårt formål</h2>
            <p className="text-muted-foreground mb-4">
              TurnusKalender ble opprettet for å gjøre det enklere for folk som jobber i turnus 
              å holde oversikt over arbeidstider og koordinere med kollegaer. Vi vet at turnusarbeid 
              kan være krevende, og ønsker å gjøre planleggingen så smidig som mulig.
            </p>
            <p className="text-muted-foreground">
              Med vår app kan du enkelt se din egen turnus, dele den med kollegaer, og holde oversikt 
              over når dere er på jobb sammen. Dette gjør det lettere å planlegge både arbeid og fritid.
            </p>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="p-8 text-center bg-primary/5">
            <h2 className="text-2xl font-bold mb-4">Kom i gang i dag</h2>
            <p className="text-muted-foreground mb-6">
              Registrer deg gratis og begynn å organisere turnusene dine
            </p>
            <Link to="/innlogging">
              <Button size="lg">
                Opprett konto
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default OmOss;
