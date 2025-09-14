import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, Users, BarChart3 } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-primary">Bondli</h1>
            <Badge variant="secondary">Beta</Badge>
          </div>
          <Button onClick={handleLogin} data-testid="button-login">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Transform Corporate Bond
            <span className="text-primary"> Trading</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Bondli brings transparency and liquidity to the Indian corporate bond market 
            through fractional ownership and real-time price discovery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleLogin} data-testid="button-get-started">
              Get Started
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold">Why Choose Bondli?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the future of corporate bond trading with our innovative platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Fractional Ownership</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Start with just ₹10,000 and own fractions of high-value corporate bonds
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Real-time Trading</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Live order books and instant trade execution with transparent pricing
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Regulatory Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Built-in KYC/AML workflows and compliance monitoring for secure trading
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Market Makers</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Institutional liquidity providers ensure tight spreads and active markets
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Bondli. Transforming corporate bond markets.</p>
        </div>
      </footer>
    </div>
  );
}