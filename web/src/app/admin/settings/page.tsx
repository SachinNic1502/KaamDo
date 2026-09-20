"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";

const commissionRules = [
  { category: "Electrician", type: "percentage", value: 10 },
  { category: "Plumbing", type: "percentage", value: 12 },
  { category: "AC Repair", type: "percentage", value: 10 },
  { category: "Carpentry", type: "percentage", value: 10 },
  { category: "Cleaning", type: "percentage", value: 15 },
  { category: "Painting Contract", type: "percentage", value: 5 },
  { category: "Labor", type: "fixed", value: 30 },
];

const cancellationPolicies = [
  { status: "Before assignment", fee: "Free" },
  { status: "After assignment", fee: "5% of job value" },
  { status: "Worker en route", fee: "Visit charge" },
  { status: "Worker arrived", fee: "Full visit charge" },
  { status: "Work started", fee: "No cancellation" },
];

const notifications = [
  { name: "New Job", description: "Send notification for new job events" },
  { name: "Job Accepted", description: "Send notification when job is accepted" },
  { name: "Worker Assigned", description: "Send notification when worker is assigned" },
  { name: "Payment Received", description: "Send notification for payment received" },
  { name: "Dispute Update", description: "Send notification for dispute updates" },
  { name: "KYC Status", description: "Send notification for KYC status changes" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Configure platform rules and policies</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="cancellation">Cancellation</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="service-areas">Service Areas</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Platform Name</Label>
                  <Input defaultValue="KaamDo" />
                </div>
                <div>
                  <Label>Tagline</Label>
                  <Input defaultValue="Har Kaam, Sahi Insaan" />
                </div>
              </div>
              <div>
                <Label>Support Email</Label>
                <Input defaultValue="support@kaamdo.com" />
              </div>
              <div>
                <Label>Support Phone</Label>
                <Input defaultValue="+91 1800-123-4567" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea defaultValue="One platform for getting local work done." />
              </div>
              <Button><Save className="mr-2 h-4 w-4" />Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Rules</CardTitle>
              <CardDescription>Configure commission rates by service category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commissionRules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="w-48 font-medium">{rule.category}</span>
                    <select className="px-3 py-2 border rounded-md text-sm w-32" defaultValue={rule.type}>
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed</option>
                    </select>
                    <Input className="w-32" defaultValue={rule.value} />
                    <span className="text-sm text-muted-foreground">{rule.type === "percentage" ? "%" : "₹"}</span>
                  </div>
                ))}
                <Button><Save className="mr-2 h-4 w-4" />Save Commission Rules</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancellation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cancellation Policy</CardTitle>
              <CardDescription>Define cancellation fees based on job status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cancellationPolicies.map((policy, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                    <span className="w-48 font-medium">{policy.status}</span>
                    <Input className="w-48" defaultValue={policy.fee} />
                  </div>
                ))}
                <Button><Save className="mr-2 h-4 w-4" />Save Cancellation Policy</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Button variant="outline" size="sm">Toggle</Button>
                </div>
              ))}
              <Button><Save className="mr-2 h-4 w-4" />Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service-areas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Areas</CardTitle>
              <CardDescription>Manage cities and service coverage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input placeholder="Add new city..." className="flex-1" />
                <Button>Add City</Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad"].map((city) => (
                  <div key={city} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{city}</span>
                    <Button variant="ghost" size="sm" className="text-red-600">Remove</Button>
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
