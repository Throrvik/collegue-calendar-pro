import { Link, useLocation } from "react-router-dom";
import { Calendar, Users, Mail, Info, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: "/", label: "Kalender", icon: Calendar },
    { path: "/kollegaer", label: "Kollegaer", icon: Users },
    { path: "/om-oss", label: "Om oss", icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-lg shadow-soft">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:bg-primary/30 transition-all" />
            <Calendar className="h-7 w-7 text-primary relative" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            TurnusKalender
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className="gap-2 transition-all hover:scale-105"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-3">
          <Link to="/profil">
            <Button variant="ghost" size="icon" className="hover:scale-110 transition-all">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/innlogging">
            <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-md">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Logg inn</span>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <nav className="md:hidden border-t border-border/50 bg-card/80 backdrop-blur-lg px-4 py-3">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className="flex-col h-auto py-2 px-4 transition-all"
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
};

export default Header;
