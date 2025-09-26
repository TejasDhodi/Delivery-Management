"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Package,
  Users,
  Truck,
  MapPin,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  CheckCircle,
  LogOut,
} from "lucide-react"
import CreateOrder from "@/components/CreateOrder"
import axios from "axios"
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation"

export interface Address {
  address: string
  lat: number
  lng: number
}

interface Order {
  id: number;
  customerName: string;
  product: string;
  pickupAddress: Address;
  deliveryAddress: Address;
  priority: "high" | "medium" | "low";
  status: "pending" | "assigned" | "in-transit" | "delivered";
  partner: string | null;
  partnerId: number | null;
  contactNumber: number;
}


export interface OrderInputs {
  customerName: string
  product: string
  pickup: Address
  delivery: Address
  priority: "high" | "medium" | "low" | ""
  status: "pending" | "assigned" | "in-transit" | "delivered"
  partner: string | null,
  contactNumber: string
}

export interface DeliveryPartner {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  status: "available" | "unavailable";
  detailsFilled: boolean;
}

export default function AdminDashboard() {
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);

  const [orderInputs, setOrderInputs] = useState<OrderInputs>({
    customerName: "",
    product: "",
    pickup: { address: "", lat: 0, lng: 0 },
    delivery: { address: "", lat: 0, lng: 0 },
    priority: "",
    status: "pending",
    partner: null,
    contactNumber: ""
  })
  const [orderId, setOrderId] = useState<null | number>(null);
  const [partnerModal, setPartnerModal] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000';
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      assigned: { variant: "default" as const, icon: Truck, label: "Assigned" },
      "in-transit": { variant: "default" as const, icon: MapPin, label: "In Transit" },
      delivered: { variant: "default" as const, icon: CheckCircle, label: "Delivered" },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: "bg-destructive/10 text-destructive border-destructive/20",
      medium: "bg-accent/10 text-accent-foreground border-accent/20",
      low: "bg-muted text-muted-foreground border-muted-foreground/20",
    }

    return (
      <Badge variant="outline" className={colors[priority as keyof typeof colors]}>
        {priority}
      </Badge>
    )
  }

  const filteredOrders = orders.filter((order) => {
    const { customerName, product, status } = order;
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleCreateOrder = async () => {
    try {
      const res = await axios.post(`${appUrl}/api/orders/create`, {
        customerName: orderInputs.customerName,
        product: orderInputs.product,
        pickupAddress: orderInputs.pickup,
        deliveryAddress: orderInputs.delivery,
        priority: orderInputs.priority,
        contactNumber: orderInputs.contactNumber
      })

      if (res.status === 201) {
        alert("Order created successfully!")
        getAllOrders();
        setIsCreateOrderOpen(false);
      } else {
        alert("Failed to create order.")
      }

    } catch (error) {
      console.error("Error creating order:", error)
    }
  }

  const getAllOrders = async () => {
    try {
      const { status, data } = await axios.get(`${appUrl}/api/orders`);

      if (status === 200) {
        setOrders(data?.data)
      }
    } catch (error) {
      console.error("Error getting order data:", error)
    }
  }

  const getDeliveryPartners = async () => {
    try {
      const { status, data } = await axios.get(`${appUrl}/api/partners/allPartners`);

      if (status === 200) {
        setDeliveryPartners(data?.data)
      }
    } catch (error) {
      console.error("Error getting Delivery Partners data:", error)
    }
  }

  const handleAssignPartner = async (orderId: number, partnerName: string, partnerId: number, orderStatus: string) => {
    try {
      if (orderStatus !== 'available') {
        alert('Partner is not available');
        return;
      }
      const { status } = await axios.patch(`${appUrl}/api/orders/assignPartner`, {
        orderId,
        partnerName,
        partnerId
      });

      if (status === 200) {
        alert('Partner assigned successfully');
        setOrderId(null);
        setPartnerModal(false)
        getAllOrders();
        getDeliveryPartners();
      }
    } catch (error) {
      console.error("Error assigning partners:", error)
    }
  }

  const showAssignPartnerModal = (orderId: number) => {
    setOrderId(orderId)
    setPartnerModal(true)
  }

  const handleLogout = () => {
    Cookies.remove('adminToken', { secure: true, sameSite: 'None' });
    router.replace("/")
  }

  const availablePartner = deliveryPartners.filter(item => item.status === 'available');
  const inTransitOrders = orders.filter(order => order.status === 'in-transit');
  const deliveredOrders = orders.filter(order => order.status === 'delivered');

  useEffect(() => {
    getAllOrders();
    getDeliveryPartners()
  }, []);

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-background">

        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Truck className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Rentkar Admin</h1>
                    <p className="text-xs text-muted-foreground">Delivery Management</p>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleLogout()}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent> 
                <div className="text-3xl font-bold text-center">{orders.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center">{deliveryPartners.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Transit</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center">{inTransitOrders.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center">{deliveredOrders.length}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="partners">Partners</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Order Management</CardTitle>
                      <CardDescription>Create, assign, and track delivery orders</CardDescription>
                    </div>
                    <CreateOrder handleCreateOrder={handleCreateOrder} setOrderInputs={setOrderInputs} orderInputs={orderInputs} isCreateOrderOpen={isCreateOrderOpen} setIsCreateOrderOpen={setIsCreateOrderOpen} />
                  </div>
                </CardHeader>
                <CardContent>

                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="in-transit">In Transit</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Partner</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => {
                          const { id, customerName, product, deliveryAddress, pickupAddress, priority, status, partner } = order;
                          const pickup = pickupAddress?.address.split(",")[0];
                          const deliver = deliveryAddress?.address.split(",")[0]
                          return (
                            <TableRow key={id}>
                              <TableCell className="font-medium">{id}</TableCell>
                              <TableCell>{customerName}</TableCell>
                              <TableCell>{product}</TableCell>
                              <TableCell className="max-w-48">
                                <div className="text-sm">
                                  <div className="font-medium">{pickup}</div>
                                  <div className="text-muted-foreground">→ {deliver}</div>
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(status)}</TableCell>
                              <TableCell>{getPriorityBadge(priority)}</TableCell>
                              <TableCell>{partner || "Unassigned"}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => showAssignPartnerModal(id)}>
                                  <MoreHorizontal className="w-4 h-4 cursor-pointer" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="partners" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Partners</CardTitle>
                  <CardDescription>Manage and assign delivery partners</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deliveryPartners.map((partner) => {
                      const { id, name, status, email, phone } = partner;
                      return (
                        <Card key={id} className="relative py-2">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{name}</CardTitle>
                              <Badge
                                variant={status === "available" ? "default" : "secondary"}
                                className={
                                  status === "available"
                                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                                    : ""
                                }
                              >
                                {status}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>{email}</p>
                              <p>{phone}</p>
                            </div>
                          </CardHeader>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Dialog open={partnerModal} onOpenChange={setPartnerModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Choose Your Partner</DialogTitle>
                <DialogDescription>Assign order to delivery partners</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="available">Available</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <ul className="space-y-2">
                    {deliveryPartners.map((currElem, index) => {
                      const { name, id, status } = currElem;
                      return (
                        <button
                          key={index}
                          className="flex justify-between w-full text-left px-4 py-2 rounded-md border border-input bg-muted cursor-pointer transition-colors"
                          onClick={() => handleAssignPartner(orderId!, name, id, status)}
                        >
                          <span>{name}</span>
                          <Badge
                            variant={status === "available" ? "default" : "secondary"}
                            className={
                              status === "available"
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : ""
                            }
                          >
                            {status}
                          </Badge>
                        </button>
                      );
                    })}
                  </ul>
                </TabsContent>

                <TabsContent value="available">
                  <div className="space-y-2">
                    {availablePartner.length > 0 ? (
                      availablePartner.map((currElem, index) => {
                        const { name, id, status } = currElem;
                        return (
                          <button
                            key={index}
                            className="w-full text-left px-4 py-2 rounded-md border border-input bg-background hover:bg-muted transition-colors"
                            onClick={() => handleAssignPartner(orderId!, name, id, status)}
                          >
                            {name}
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground">No available partners</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>


        </div>
      </div>
    </AuthGuard>
  )
}
