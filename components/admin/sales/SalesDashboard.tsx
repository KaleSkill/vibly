'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, 
  CreditCard, 
  Truck, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export function SalesDashboard() {
  const [timeRange, setTimeRange] = useState('7days');

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex justify-end">
        <Select
          value={timeRange}
          onValueChange={setTimeRange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <h3 className="text-2xl font-bold">₹45,231</h3>
              <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                <ArrowUpRight className="h-4 w-4" />
                <span>12.5%</span>
              </div>
            </div>
            <div className="p-4 bg-primary/10 rounded-full">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <h3 className="text-2xl font-bold">126</h3>
              <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                <ArrowUpRight className="h-4 w-4" />
                <span>8.2%</span>
              </div>
            </div>
            <div className="p-4 bg-blue-100 rounded-full">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Online Payments</p>
              <h3 className="text-2xl font-bold">82</h3>
              <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                <ArrowDownRight className="h-4 w-4" />
                <span>3.1%</span>
              </div>
            </div>
            <div className="p-4 bg-green-100 rounded-full">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">COD Orders</p>
              <h3 className="text-2xl font-bold">44</h3>
              <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                <ArrowUpRight className="h-4 w-4" />
                <span>5.8%</span>
              </div>
            </div>
            <div className="p-4 bg-orange-100 rounded-full">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Add more analytics components here */}
    </div>
  );
} 