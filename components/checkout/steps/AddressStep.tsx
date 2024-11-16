'use client';

import { useState, useEffect } from 'react';
import { useCheckout } from '@/providers/CheckoutProvider';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, Plus } from 'lucide-react';

interface Address {
  _id: string;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export function AddressStep() {
  const { setStep, selectedAddress, setSelectedAddress } = useCheckout();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/addresses');
      if (!response.ok) throw new Error('Failed to fetch addresses');
      const data = await response.json();
      setAddresses(data);
      // Select default address if none selected
      if (!selectedAddress && data.length > 0) {
        const defaultAddress = data.find((addr: Address) => addr.isDefault) || data[0];
        setSelectedAddress(defaultAddress._id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async () => {
    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAddress),
      });

      if (!response.ok) throw new Error('Failed to add address');

      await fetchAddresses();
      setIsDialogOpen(false);
      setNewAddress({
        fullName: '',
        phoneNumber: '',
        streetAddress: '',
        city: '',
        state: '',
        pincode: ''
      });

      toast({
        title: "Success",
        description: "Address added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add address",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Select Delivery Address</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add New Address
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Address</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={newAddress.phoneNumber}
                    onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={newAddress.streetAddress}
                    onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAddress}>
                  Add Address
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-gray-50">
            <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No addresses found</p>
            <p className="text-sm text-gray-400 mb-4">Add a new address to continue</p>
          </div>
        ) : (
          <RadioGroup
            value={selectedAddress || ''}
            onValueChange={setSelectedAddress}
            className="space-y-4"
          >
            {addresses.map((address) => (
              <div
                key={address._id}
                className={`border rounded-lg p-4 transition-colors ${
                  selectedAddress === address._id ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <RadioGroupItem
                  value={address._id}
                  id={address._id}
                  className="sr-only"
                />
                <Label
                  htmlFor={address._id}
                  className="flex flex-col cursor-pointer"
                >
                  <span className="font-medium flex items-center gap-2">
                    {address.fullName}
                    {address.isDefault && (
                      <Badge variant="secondary" className="text-xs">Default</Badge>
                    )}
                  </span>
                  <span className="text-sm text-muted-foreground mt-1">
                    {address.streetAddress}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {address.city}, {address.state} {address.pincode}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Phone: {address.phoneNumber}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => setStep('cart')}
        >
          Back to Cart
        </Button>
        <Button 
          className="flex-1 bg-black hover:bg-black/90"
          onClick={() => {
            if (!selectedAddress) {
              toast({
                title: "Error",
                description: "Please select a delivery address",
                variant: "destructive",
              });
              return;
            }
            setStep('payment');
          }}
          disabled={!selectedAddress}
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
} 