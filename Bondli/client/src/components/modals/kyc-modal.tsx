import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, FileText, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface KYCModalProps {
  open: boolean;
  onClose: () => void;
}

interface KYCData {
  fullName: string;
  panNumber: string;
  aadhaarNumber: string;
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
}

const KYC_STEPS = [
  { id: 1, title: "Personal Info", icon: FileText },
  { id: 2, title: "Documents", icon: Camera },
  { id: 3, title: "Verification", icon: CheckCircle },
];

export default function KYCModal({ open, onClose }: KYCModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [kycData, setKycData] = useState<KYCData>({
    fullName: "",
    panNumber: "",
    aadhaarNumber: "",
    dateOfBirth: "",
    address: "",
    phoneNumber: "",
  });
  const [documents, setDocuments] = useState<{
    panCard: File | null;
    aadhaarCard: File | null;
    addressProof: File | null;
  }>({
    panCard: null,
    aadhaarCard: null,
    addressProof: null,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitKYCMutation = useMutation({
    mutationFn: async (data: any) => {
      // In a real app, this would upload documents and submit KYC data
      await apiRequest('POST', '/api/kyc/submit', data);
    },
    onSuccess: () => {
      toast({
        title: "KYC Submitted Successfully",
        description: "Your KYC application has been submitted for review. You will be notified once it's processed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "KYC Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setCurrentStep(1);
    setKycData({
      fullName: "",
      panNumber: "",
      aadhaarNumber: "",
      dateOfBirth: "",
      address: "",
      phoneNumber: "",
    });
    setDocuments({
      panCard: null,
      aadhaarCard: null,
      addressProof: null,
    });
  };

  const handleInputChange = (field: keyof KYCData, value: string) => {
    setKycData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: keyof typeof documents, file: File | null) => {
    setDocuments(prev => ({ ...prev, [field]: file }));
  };

  const validateStep1 = () => {
    return kycData.fullName && 
           kycData.panNumber && 
           kycData.aadhaarNumber && 
           kycData.dateOfBirth &&
           kycData.phoneNumber;
  };

  const validateStep2 = () => {
    return documents.panCard && documents.aadhaarCard;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep === 2 && !validateStep2()) {
      toast({
        title: "Documents Required",
        description: "Please upload PAN and Aadhaar documents.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = () => {
    const formData = {
      ...kycData,
      documents: {
        panCard: documents.panCard?.name,
        aadhaarCard: documents.aadhaarCard?.name,
        addressProof: documents.addressProof?.name,
      }
    };
    
    submitKYCMutation.mutate(formData);
  };

  const formatAadhaar = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/(\d{0,4})(\d{0,4})(\d{0,4})/);
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join(' ');
    }
    return value;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Complete KYC Verification</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Step Progress */}
          <div className="flex items-center justify-between">
            {KYC_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    isActive && "bg-primary text-primary-foreground",
                    isCompleted && "bg-success text-white",
                    !isActive && !isCompleted && "bg-muted text-muted-foreground"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={cn(
                    "ml-2 text-sm",
                    isActive && "text-primary font-medium",
                    isCompleted && "text-success",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                  {index < KYC_STEPS.length - 1 && (
                    <div className={cn(
                      "w-8 h-0.5 mx-4",
                      isCompleted ? "bg-success" : "bg-border"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name as per PAN"
                    value={kycData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    data-testid="input-full-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="panNumber">PAN Number *</Label>
                  <Input
                    id="panNumber"
                    placeholder="ABCDE1234F"
                    value={kycData.panNumber}
                    onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                    maxLength={10}
                    data-testid="input-pan-number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
                  <Input
                    id="aadhaarNumber"
                    placeholder="1234 5678 9012"
                    value={kycData.aadhaarNumber}
                    onChange={(e) => handleInputChange('aadhaarNumber', formatAadhaar(e.target.value))}
                    maxLength={14}
                    data-testid="input-aadhaar-number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={kycData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    data-testid="input-date-of-birth"
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+91 98765 43210"
                    value={kycData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    data-testid="input-phone-number"
                  />
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 2: Document Upload */}
          {currentStep === 2 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="panCard">PAN Card * (Front side)</Label>
                  <Input
                    id="panCard"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange('panCard', e.target.files?.[0] || null)}
                    data-testid="input-pan-card"
                  />
                  {documents.panCard && (
                    <p className="text-sm text-success mt-1">✓ {documents.panCard.name}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="aadhaarCard">Aadhaar Card * (Front and back)</Label>
                  <Input
                    id="aadhaarCard"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange('aadhaarCard', e.target.files?.[0] || null)}
                    data-testid="input-aadhaar-card"
                  />
                  {documents.aadhaarCard && (
                    <p className="text-sm text-success mt-1">✓ {documents.aadhaarCard.name}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="addressProof">Address Proof (Optional)</Label>
                  <Input
                    id="addressProof"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange('addressProof', e.target.files?.[0] || null)}
                    data-testid="input-address-proof"
                  />
                  {documents.addressProof && (
                    <p className="text-sm text-success mt-1">✓ {documents.addressProof.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Bank statement, utility bill, or rental agreement
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 3: Verification */}
          {currentStep === 3 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Submit</h3>
                  <p className="text-muted-foreground mb-4">
                    Please review your information before submitting your KYC application.
                  </p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span className="font-medium">{kycData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PAN:</span>
                    <span className="font-medium">{kycData.panNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Documents:</span>
                    <span className="font-medium">
                      {Object.values(documents).filter(Boolean).length} uploaded
                    </span>
                  </div>
                </div>
                
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">
                    By submitting this application, you confirm that all information provided is accurate 
                    and you consent to the verification process. Your application will be reviewed within 
                    2-3 business days.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            {currentStep < 3 ? (
              <>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={onClose}
                  data-testid="button-cancel-kyc"
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleNextStep}
                  data-testid="button-continue-kyc"
                >
                  Continue
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setCurrentStep(2)}
                  data-testid="button-back-kyc"
                >
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleSubmit}
                  disabled={submitKYCMutation.isPending}
                  data-testid="button-submit-kyc"
                >
                  {submitKYCMutation.isPending ? 'Submitting...' : 'Submit Application'}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
