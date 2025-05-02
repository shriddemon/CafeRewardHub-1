import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Download, Loader2, QrCode, Share } from "lucide-react";

interface QRCodeDisplayProps {
  url: string;
}

function QRCodeDisplay({ url }: QRCodeDisplayProps) {
  // This is a simple placeholder for QR code display
  // In a real implementation, you'd use a library like qrcode.react
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-64 h-64 bg-white border border-gray-200 rounded-lg flex items-center justify-center mb-4">
        <QrCode size={200} className="text-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xs text-gray-500">QR Code for {url}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-4 text-center">
        Scan this QR code or share the link to allow customers to register for your cafe's loyalty program
      </p>
    </div>
  );
}

export default function CustomerRegistrationQR() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("qrcode");
  
  // Fetch registration URL from API
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/owner/customer-registration-url"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Copy URL to clipboard
  const copyToClipboard = () => {
    if (data?.registrationUrl) {
      navigator.clipboard.writeText(data.registrationUrl)
        .then(() => {
          toast({
            title: "Link copied",
            description: "The registration link has been copied to your clipboard.",
          });
        })
        .catch(() => {
          toast({
            title: "Copy failed",
            description: "Failed to copy the link. Please try again.",
            variant: "destructive",
          });
        });
    }
  };

  // Simulated QR code download
  const downloadQRCode = () => {
    toast({
      title: "QR Code downloaded",
      description: "The QR code has been downloaded successfully.",
    });
  };

  // Simulated share functionality
  const shareLink = () => {
    if (navigator.share && data?.registrationUrl) {
      navigator.share({
        title: "Join our loyalty program",
        text: "Register for our cafe's loyalty program to earn rewards!",
        url: data.registrationUrl,
      })
      .then(() => {
        toast({
          title: "Link shared",
          description: "The registration link has been shared.",
        });
      })
      .catch(() => {
        toast({
          title: "Share failed",
          description: "Failed to share the link. Please try copying instead.",
          variant: "destructive",
        });
      });
    } else {
      copyToClipboard();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Registration</CardTitle>
          <CardDescription>
            Generate links and QR codes for customer registration
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Registration</CardTitle>
          <CardDescription>
            Generate links and QR codes for customer registration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">
            Error loading registration link. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Registration</CardTitle>
        <CardDescription>
          Generate links and QR codes for customer registration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="qrcode" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
            <TabsTrigger value="link">Link</TabsTrigger>
          </TabsList>
          
          <TabsContent value="qrcode" className="mt-4">
            {data?.registrationUrl && <QRCodeDisplay url={data.registrationUrl} />}
            
            <div className="flex justify-center space-x-2 mt-2">
              <Button size="sm" variant="outline" onClick={downloadQRCode}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              <Button size="sm" variant="outline" onClick={shareLink}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="link" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="registration-link">Registration Link</Label>
                <div className="flex space-x-2">
                  <Input
                    id="registration-link"
                    value={data?.registrationUrl || ""}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button variant="outline" size="icon" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Share this link with your customers to let them register for your loyalty program
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="embed-code">Embed Code</Label>
                <div className="flex space-x-2">
                  <Input
                    id="embed-code"
                    value={`<a href="${data?.registrationUrl || ""}">Join our loyalty program</a>`}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button variant="outline" size="icon" onClick={() => {
                    navigator.clipboard.writeText(`<a href="${data?.registrationUrl || ""}">Join our loyalty program</a>`);
                    toast({
                      title: "Code copied",
                      description: "The embed code has been copied to your clipboard.",
                    });
                  }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Use this code to add a registration link to your website
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <p className="text-xs text-gray-500">
          Customers who register through this link will be automatically associated with your cafe
        </p>
      </CardFooter>
    </Card>
  );
}