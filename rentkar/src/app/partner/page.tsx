"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Package,
  Clock,
  CheckCircle,
  Navigation,
  Phone,
  LogOut,
  Truck,
  User,
  PackageCheck,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
});

export default function PartnerDashboard() {
  const [isAvailable, setIsAvailable] = useState(false);

  const [partnerDetails, setPartnerDetails] = useState({
    name: "",
    phone: "",
  });
  const [partnerProfile, setPartnerProfile] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
  });

  const [assignedOrders, setAssignedOrders] = useState([]);
  const [fillDetails, setFillDetails] = useState(false);

  const [selectedRoute, setSelectedRoute] = useState<{
    pickup: { lat: number; lng: number; address: string };
    delivery: { lat: number; lng: number; address: string };
  } | null>(null);

  const [partnerDetailsLoading, setPartnerDetailsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000";
  const token = Cookies.get("token");

  const router = useRouter();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPartnerDetails((prev) => ({ ...prev, [name]: value }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      assigned: {
        variant: "secondary" as const,
        icon: Clock,
        label: "New Assignment",
      },
      "picked-up": {
        variant: "default" as const,
        icon: Package,
        label: "Picked Up",
      },
      "in-transit": {
        variant: "default" as const,
        icon: Truck,
        label: "In Transit",
      },
      pending: { variant: "default" as const, icon: Clock, label: "Pending" },
      delivered: {
        variant: "default" as const,
        icon: PackageCheck,
        label: "Delivered",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];

    if (!config) {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Unknown Status
        </Badge>
      );
    }

    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: "bg-destructive/10 text-destructive border-destructive/20",
      medium: "bg-accent/10 text-accent-foreground border-accent/20",
      low: "bg-muted text-muted-foreground border-muted-foreground/20",
    };

    return (
      <Badge
        variant="outline"
        className={colors[priority as keyof typeof colors]}
      >
        {priority} priority
      </Badge>
    );
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { status } = await axios.patch(
        `${appUrl}/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (status === 200) {
        alert(`Order marked as ${newStatus}`);
        pendingOrdersPartner();
        getPartnerDetails();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const { status } = await axios.put(
        `${appUrl}/api/partners/completeRegistration`,
        partnerDetails,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (status === 200) {
        setFillDetails(false);
        getPartnerDetails();
        window.history.replaceState(null, "", `${window.location.pathname}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getPartnerDetails = async () => {
    try {
      setPartnerDetailsLoading(true);
      const { status, data } = await axios.get(
        `${appUrl}/api/partners/profile`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (status === 200) {
        setPartnerProfile(data?.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setPartnerDetailsLoading(false);
    }
  };

  const pendingOrdersPartner = async () => {
    try {
      setOrdersLoading(true);
      const { status, data } = await axios.get(
        `${appUrl}/api/orders/pendingOrdersPartner`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (status === 200) {
        setAssignedOrders(data?.data);
        console.log("Pending Orders:", data?.data);
        
      }
    } catch (error) {
      console.log(error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleAvailableStatus = async () => {
    try {
      const { status } = await axios.patch(
        `${appUrl}/api/partners/updateStatus`,
        { status: isAvailable ? "available" : "unavailable" },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (status === 200) {
        setIsAvailable(!isAvailable);
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  const handleLogout = () => {
    Cookies.remove("token", { secure: true, sameSite: "None" });
    router.replace("/")
  }
  useEffect(() => {
    getPartnerDetails();
  }, []);

  useEffect(() => {
    pendingOrdersPartner();
  }, []);

  useEffect(() => {
    if (partnerProfile && partnerProfile.status) {
      setIsAvailable(partnerProfile.status === "available");
    }
  }, [partnerProfile]);

  useEffect(() => {
    if (!partnerDetailsLoading) {
      const isIncomplete = !partnerProfile.name || !partnerProfile.phone;
      setFillDetails(isIncomplete);
    }
  }, [partnerDetailsLoading, partnerProfile]);

  return (
    <AuthGuard requiredRole="partner">
      <div className="min-h-screen bg-background">

        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Partner Dashboard</h1>
                    <p className="text-xs text-muted-foreground">
                      Welcome, {partnerDetailsLoading ? "Loading..." : partnerProfile.name}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div
                  className="flex items-center space-x-2"
                  onClick={() => handleAvailableStatus()}
                >
                  <Label htmlFor="availability" className="text-sm">
                    Available
                  </Label>
                  <Switch
                    id="availability"
                    checked={isAvailable}
                    onCheckedChange={setIsAvailable}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLogout()}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <div className="grid gap-6">
            {
              ordersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((_, idx) => (
                    <Card key={idx} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 w-1/3 bg-muted rounded mb-2" />
                        <div className="h-3 w-1/4 bg-muted rounded" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-3 w-2/3 bg-muted rounded mb-2" />
                        <div className="h-3 w-1/2 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) :
              assignedOrders.map((order) => {
                const { customerName, product, id, status, priority, pickupAddress, deliveryAddress, contactNumber } = order;
                const { address: pAddress } = pickupAddress;
                const { address: dAddress } = deliveryAddress;
                return (
                  <Card key={id} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          <strong>{customerName}</strong> • {product}
                        </CardTitle>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(status)}
                        {getPriorityBadge(priority)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">

                      <div className="space-y-3 flex justify-between items-center">
                        <div className="details">
                          <div className="flex items-start space-x-3">
                            <div className="w-3 h-3 rounded-full bg-accent mt-1.5"></div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                Pickup Location
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {pAddress}
                              </p>
                            </div>
                          </div>
                          <div className="ml-6 border-l-2 border-dashed border-muted h-4"></div>
                          <div className="flex items-start space-x-3">
                            <div className="w-3 h-3 rounded-full bg-primary mt-1.5"></div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                Delivery Location
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {dAddress}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setSelectedRoute({
                              pickup: pickupAddress,
                              delivery: deliveryAddress,
                            })
                          }
                        >
                          <Navigation className="w-4 h-4 mr-1" />
                          Navigate
                        </Button>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{contactNumber}</span>
                        </div>
                        <div className="flex space-x-2">
                          {status === "assigned" && (
                            <Button
                              size="sm"
                              className="glow-accent"
                              onClick={() =>
                                updateOrderStatus(id, "in-transit")
                              }
                            >
                              Mark as Picked Up
                            </Button>
                          )}
                          {status === "in-transit" && (
                            <Button
                              size="sm"
                              className="glow-primary"
                              onClick={() =>
                                updateOrderStatus(id, "delivered")
                              }
                            >
                              Mark as Delivered
                            </Button>
                          )}
                          {status === "delivered" && (
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-500 border-green-500/20"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Delivered
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            }

            {
              assignedOrders.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Active Orders</h3>
                    <p className="text-muted-foreground text-center">
                      You don&apos;t have any assigned orders right now. Make sure
                      your availability is turned on to receive new assignments.
                    </p>
                  </CardContent>
                </Card>
              )
            }
          </div>
        </div>
      </div>

      <Dialog
        open={!!selectedRoute}
        onOpenChange={() => setSelectedRoute(null)}
      >
        <DialogContent className="w-full max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Route Overview</DialogTitle>
            <DialogDescription>
              From: {selectedRoute?.pickup.address} → To:{" "}
              {selectedRoute?.delivery.address}
            </DialogDescription>
          </DialogHeader>
          <div className="h-[500px] w-full">
            {selectedRoute && (
              <MapComponent
                start={selectedRoute.pickup}
                end={selectedRoute.delivery}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={fillDetails} onOpenChange={setFillDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Partner Details</DialogTitle>
            <DialogDescription>
              Provide the necessary information to complete the profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="mb-2">
                Partner Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={partnerDetails.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="mb-2">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={partnerDetails.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setFillDetails(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Submit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}
