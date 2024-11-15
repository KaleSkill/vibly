'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Package, ShoppingBag, DollarSign } from "lucide-react";

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    icon: DollarSign,
    description: "Total revenue this month",
  },
  {
    title: "Total Orders",
    value: "256",
    icon: ShoppingBag,
    description: "+20.1% from last month",
  },
  {
    title: "Total Products",
    value: "124",
    icon: Package,
    description: "Active products in store",
  },
  {
    title: "Total Users",
    value: "573",
    icon: Users,
    description: "+201 since last month",
  },
];

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 