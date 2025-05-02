import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, QrCode, Users, Copy, Share2, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// QR Code component that renders a QR code
interface QRCodeDisplayProps {
  url: string;
}

function QRCodeDisplay({ url }: QRCodeDisplayProps) {
  const [qrCodeSvg, setQrCodeSvg] = useState<string>("");
  
  useEffect(() => {
    async function generateQRCode() {
      try {
        // We'll use a simple SVG-based QR code here
        const res = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&format=svg`);
        const svg = await res.text();
        setQrCodeSvg(svg);
      } catch (error) {
        console.error("Failed to generate QR code:", error);
      }
    }
    
    if (url) {
      generateQRCode();
    }
  }, [url]);
  
  if (!qrCodeSvg) {
    return (
      <div className="h-[200px] w-[200px] flex items-center justify-center bg-gray-100 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex justify-center">
      <div 
        className="h-[200px] w-[200px] bg-white p-2 rounded-lg"
        dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
      />
    </div>
  );
}

export default function CustomerRegistrationQR() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("qr-code");
  
  // Fetch the customer registration URL
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/owner/customer-registration-url"],
    enabled: !!user && user.role === "owner",
  });
  
  const registrationUrl = data?.registrationUrl || "";
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied!",
          description: "Link copied to clipboard",
        });
      },
      (err) => {
        console.error("Failed to copy text: ", err);
        toast({
          title: "Failed to copy",
          description: "Could not copy the link to clipboard",
          variant: "destructive",
        });
      }
    );
  };
  
  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Register for our loyalty program",
        text: "Join our loyalty program and start earning rewards!",
        url: registrationUrl,
      })
      .then(() => {
        toast({
          title: "Link shared",
          description: "Registration link has been shared successfully",
        });
      })
      .catch((error) => {
        console.error("Error sharing:", error);
      });
    } else {
      copyToClipboard(registrationUrl);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Customer Registration</CardTitle>
          <CardDescription>Generate registration links and QR codes for your customers</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Customer Registration</CardTitle>
          <CardDescription>Generate registration links and QR codes for your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">Failed to load registration information</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>Customer Registration</CardTitle>
        </div>
        <CardDescription>
          Share registration links or QR codes with your customers so they can join your loyalty program
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="qr-code" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid grid-cols-2">
            <TabsTrigger value="qr-code" className="flex items-center">
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center">
              <LinkIcon className="h-4 w-4 mr-2" />
              Registration Link
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="qr-code" className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center">
              <div className="mb-4 text-center">
                <h3 className="font-medium text-lg">Customer Registration QR Code</h3>
                <p className="text-sm text-gray-500">
                  Customers can scan this QR code to register for your loyalty program
                </p>
              </div>
              
              <QRCodeDisplay url={registrationUrl} />
              
              <div className="mt-6 flex space-x-2 justify-center w-full">
                <Button
                  variant="outline"
                  className="flex items-center"
                  onClick={() => {
                    // For an actual implementation, we'd use a library to generate and download the QR code
                    // This is a simplified version for demonstration
                    const link = document.createElement("a");
                    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(registrationUrl)}&format=png&download=1`;
                    link.setAttribute("download", "customer-registration-qr.png");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download
                </Button>
                
                <Button 
                  variant="secondary"
                  className="flex items-center"
                  onClick={() => {
                    shareLink();
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-accent/30 rounded-lg">
              <p className="text-sm">
                <strong>Tip:</strong> Print this QR code and place it at your counter or on your menu to allow customers to register easily.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="link" className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="mb-4">
                <h3 className="font-medium text-lg">Customer Registration Link</h3>
                <p className="text-sm text-gray-500">
                  Share this link with your customers to join your loyalty program
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Input 
                  readOnly 
                  value={registrationUrl}
                  className="font-mono text-sm bg-white"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(registrationUrl)}
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-6 space-y-2">
                <Button 
                  className="w-full"
                  onClick={() => {
                    shareLink();
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Registration Link
                </Button>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-accent/30 rounded-lg">
              <p className="text-sm">
                <strong>Tip:</strong> You can send this link to customers via email, SMS, or social media. Customers who register will be automatically linked to your cafe.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-6 flex flex-col items-start">
        <h4 className="font-medium mb-2">How it works</h4>
        <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
          <li>Share the registration link or QR code with your customers</li>
          <li>Customers click the link or scan the QR code to access the registration page</li>
          <li>They create an account that's automatically linked to your cafe</li>
          <li>Once registered, they can start earning and redeeming rewards</li>
        </ol>
      </CardFooter>
    </Card>
  );
}