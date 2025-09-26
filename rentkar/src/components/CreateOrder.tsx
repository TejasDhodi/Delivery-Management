import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AddressInput from './AddressInput'
import { OrderInputs } from '@/app/admin/page'



interface CreateOrderProps {
    isCreateOrderOpen: boolean;
    setIsCreateOrderOpen: (open: boolean) => void;
    orderInputs: OrderInputs,
    setOrderInputs: React.Dispatch<React.SetStateAction<OrderInputs>>,
    handleCreateOrder: () => void;
}

const CreateOrder = ({isCreateOrderOpen, setIsCreateOrderOpen, orderInputs, setOrderInputs, handleCreateOrder}: CreateOrderProps) => {

    const createOrder = () => {
        handleCreateOrder();
    }
    return (
        <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
            <DialogTrigger asChild>
                <Button className="glow-primary cursor-pointer">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Order
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Order</DialogTitle>
                    <DialogDescription>Add a new delivery order to the system</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="customer">Customer Name</Label>
                        <Input id="customer" placeholder="Enter customer name" onChange={(e) => setOrderInputs((prev) => ({ ...prev, customerName: e.target.value })) }/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="product">Product</Label>
                        <Input id="product" placeholder="Enter product name" onChange={(e) => setOrderInputs((prev) => ({ ...prev, product: e.target.value })) }/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactNumber">Contact Number</Label>
                        <Input id="contactNumber" placeholder="Enter Contact Number" onChange={(e) => setOrderInputs((prev) => ({ ...prev, contactNumber: e.target.value })) }/>
                    </div>
                    <AddressInput
                        label="Pickup Address"
                        onSelect={(val) =>
                        setOrderInputs((prev) => ({ ...prev, pickup: val }))
                        }
                    />

                    <AddressInput
                        label="Delivery Address"
                        onSelect={(val) =>
                        setOrderInputs((prev) => ({ ...prev, delivery: val }))
                        }
                    />
                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select onValueChange={(value: "high" | "medium" | "low") => setOrderInputs((prev) => ({ ...prev, priority: value })) }>
                            <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full" onClick={() => createOrder()}>
                        Create Order
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrder
