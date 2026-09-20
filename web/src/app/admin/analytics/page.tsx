"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, Briefcase, IndianRupee, Download } from "lucide-react";

const jobStats = [
  { month: "Jan", total: 120, completed: 95, cancelled: 15 },
  { month: "Feb", total: 145, completed: 120, cancelled: 10 },
  { month: "Mar", total: 160, completed: 140, cancelled: 12 },
  { month: "Apr", total: 180, completed: 155, cancelled: 18 },
  { month: "May", total: 200, completed: 175, cancelled: 14 },
  { month: "Jun", total: 220, completed: 195, cancelled: 16 },
];

const topServices = [
  { name: "Electrician", jobs: 456, revenue: 136800, avgRating: 4.5 },
  { name: "Plumbing", jobs: 389, revenue: 116700, avgRating: 4.3 },
  { name: "AC Repair", jobs: 312, revenue: 156000, avgRating: 4.6 },
  { name: "Carpentry", jobs: 278, revenue: 139000, avgRating: 4.2 },
  { name: "Cleaning", jobs: 245, revenue: 147000, avgRating: 4.7 },
];

const topLocations = [
  { city: "Bangalore", jobs: 856, workers: 234, revenue: 428000 },
  { city: "Mumbai", jobs: 623, workers: 189, revenue: 311500 },
  { city: "Delhi", jobs: 567, workers: 167, revenue: 283500 },
  { city: "Hyderabad", jobs: 445, workers: 134, revenue: 222500 },
  { city: "Chennai", jobs: 389, workers: 112, revenue: 194500 },
];

const workerStats = [
  { name: "Amit Singh", jobs: 45, rating: 4.9, earnings: 67500 },
  { name: "Vikram Yadav", jobs: 42, rating: 4.8, earnings: 63000 },
  { name: "Rajesh Kumar", jobs: 38, rating: 4.7, earnings: 57000 },
  { name: "Manoj Tiwari", jobs: 35, rating: 4.6, earnings: 52500 },
  { name: "Sanjay Verma", jobs: 33, rating: 4.5, earnings: 49500 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights and performance metrics</p>
        </div>
        <Button><Download className="mr-2 h-4 w-4" />Export Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Job Value</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹45.6L</div>
            <p className="text-xs text-green-600">+18% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹4.56L</div>
            <p className="text-xs text-green-600">+18% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Job Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2,072</div>
            <p className="text-xs text-green-600">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 days</div>
            <p className="text-xs text-green-600">-0.3 days from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">Job Analytics</TabsTrigger>
          <TabsTrigger value="services">Top Services</TabsTrigger>
          <TabsTrigger value="locations">Top Locations</TabsTrigger>
          <TabsTrigger value="workers">Top Workers</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Trends (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jobStats.map((stat) => (
                  <div key={stat.month} className="flex items-center gap-4">
                    <span className="w-12 text-sm font-medium">{stat.month}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-4 bg-green-500 rounded" style={{ width: `${(stat.completed / 220) * 100}%` }} />
                        <span className="text-xs text-muted-foreground">{stat.completed}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 bg-red-400 rounded" style={{ width: `${(stat.cancelled / 220) * 100}%` }} />
                        <span className="text-xs text-muted-foreground">{stat.cancelled}</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium">{stat.total}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topServices.map((service, index) => (
                  <div key={service.name} className="flex items-center gap-4 p-3 border rounded-lg">
                    <span className="text-lg font-bold text-muted-foreground w-8">{index + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.jobs} jobs • ₹{service.revenue.toLocaleString()} revenue</p>
                    </div>
                    <Badge variant="outline">⭐ {service.avgRating}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Cities by Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topLocations.map((loc, index) => (
                  <div key={loc.city} className="flex items-center gap-4 p-3 border rounded-lg">
                    <span className="text-lg font-bold text-muted-foreground w-8">{index + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium">{loc.city}</p>
                      <p className="text-sm text-muted-foreground">{loc.jobs} jobs • {loc.workers} workers</p>
                    </div>
                    <span className="font-medium">₹{loc.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Workers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workerStats.map((worker, index) => (
                  <div key={worker.name} className="flex items-center gap-4 p-3 border rounded-lg">
                    <span className="text-lg font-bold text-muted-foreground w-8">{index + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium">{worker.name}</p>
                      <p className="text-sm text-muted-foreground">{worker.jobs} jobs completed</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">⭐ {worker.rating}</Badge>
                      <p className="text-sm font-medium mt-1">₹{worker.earnings.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
