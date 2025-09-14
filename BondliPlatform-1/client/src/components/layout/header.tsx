import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu } from "lucide-react";
import KYCModal from "@/components/modals/kyc-modal";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showKYCModal, setShowKYCModal] = useState(false);

  return (
    <>
      <header className="bg-card border-b border-border px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onMenuClick}
              data-testid="button-mobile-menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-foreground">Market Overview</h2>
              <p className="text-sm text-muted-foreground hidden sm:block">Real-time corporate bond trading platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="bg-success/10 text-success px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium">
              <span className="inline-block w-2 h-2 bg-success rounded-full mr-1 lg:mr-2 animate-pulse-slow"></span>
              <span className="hidden sm:inline">Live Market</span>
              <span className="sm:hidden">Live</span>
            </div>
            <Button 
              onClick={() => setShowKYCModal(true)}
              data-testid="button-complete-kyc"
              size="sm"
              className="text-xs lg:text-sm"
            >
              <span className="hidden sm:inline">Complete KYC</span>
              <span className="sm:hidden">KYC</span>
            </Button>
          </div>
        </div>
      </header>
      
      <KYCModal open={showKYCModal} onClose={() => setShowKYCModal(false)} />
    </>
  );
}
