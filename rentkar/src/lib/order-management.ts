export interface Order {
    id: string
    customer: string
    product: string
    pickup: {
      address: string
      lat: number
      lng: number
    }
    delivery: {
      address: string
      lat: number
      lng: number
    }
    status: "pending" | "assigned" | "picked-up" | "in-transit" | "delivered" | "cancelled"
    priority: "high" | "medium" | "low"
    partner?: string
    created: string
    customerPhone: string
  }
  
  export interface DeliveryPartner {
    id: string
    name: string
    phone: string
    email: string
    status: "available" | "busy" | "offline"
    location: string
    rating: number
    completedOrders: number
    currentOrders?: string[]
  }
  