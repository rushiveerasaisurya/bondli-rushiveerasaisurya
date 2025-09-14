import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Briefcase, 
  Settings, 
  TrendingUp, 
  Users, 
  ArrowRightLeft,
  Coins,
  X,
  LogOut
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Bond Catalog", href: "/bonds", icon: Coins },
  { name: "Trading", href: "/trading", icon: TrendingUp },
  { name: "Portfolio", href: "/portfolio", icon: Briefcase },
  { name: "Market Making", href: "/market-maker", icon: ArrowRightLeft },
  { name: "Admin", href: "/admin", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className={cn(
      "w-64 bg-card border-r border-border flex flex-col",
      "lg:relative lg:translate-x-0 flex-shrink-0",
      "fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:transition-none",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="text-primary-foreground text-sm" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Bondli</h1>
          </div>
          {/* Mobile close button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="lg:hidden"
            onClick={onClose}
            data-testid="button-close-menu"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Corporate Bond Platform</p>
      </div>
      
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto p-4 border-t border-border">
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {user.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-medium text-sm">
                    {user.firstName?.[0] || user.email?.[0] || 'U'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.kycStatus === 'approved' ? 'Verified Trader' : 'Pending KYC'}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-medium text-sm">U</span>
              </div>
              <div>
                <p className="font-medium text-sm">Loading...</p>
                <p className="text-xs text-muted-foreground">Please wait</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
