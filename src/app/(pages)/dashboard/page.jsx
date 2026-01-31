"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Crown,
  Building2,
  LogOut,
  Settings,
  CreditCard,
} from "lucide-react";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-linear-to-br from-blue-950 to-[#7f5d2b] text-white">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/10 p-6">
        <h2 className="text-2xl font-bold mb-10">The Building Mall</h2>
        <nav className="space-y-4">
          <NavItem icon={<LayoutDashboard />} label="Dashboard" active />
          <NavItem icon={<Building2 />} label="My Services" />
          <NavItem icon={<Users />} label="Leads" />
          <NavItem icon={<CreditCard />} label="Membership" />
          <NavItem icon={<Settings />} label="Settings" />
        </nav>
        <div className="mt-auto">
          <Button variant="outline" className="w-full flex gap-2">
            <LogOut size={18} /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Topbar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-10"
        >
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-white/60">Welcome back, Verified Member</p>
          </div>
          <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-4 py-1">
            Gold Member
          </Badge>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard icon={<Users />} title="Active Clients" value="128" />
          <StatCard icon={<Building2 />} title="Projects" value="42" />
          <StatCard icon={<Crown />} title="Membership" value="Gold" />
        </div>

        {/* Membership Card */}
        <Card className="bg-white/5 border border-white/10 rounded-2xl mb-10">
          <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-2xl font-semibold">Membership Status</h2>
              <p className="text-white/60">Gold plan · expires in 18 days</p>
              <Progress value={70} className="mt-4" />
            </div>
            <Button className="bg-gradient-to-r from-indigo-500 to-blue-600 px-8">
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>

        {/* Trust Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TrustCard
            title="Business Verified"
            desc="Your documents have been successfully verified"
          />
          <TrustCard
            title="Profile Strength"
            desc="Complete your profile to get more leads"
            progress={85}
          />
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition ${
        active ? "bg-indigo-500/20 text-indigo-400" : "hover:bg-white/10"
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <Card className="bg-white/5 border border-white/10 rounded-2xl">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="p-3 bg-indigo-500/20 rounded-xl">{icon}</div>
        <div>
          <p className="text-white/60">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}

function TrustCard({ title, desc, progress }) {
  return (
    <Card className="bg-white/5 border border-white/10 rounded-2xl">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-1">{title}</h3>
        <p className="text-white/60 mb-4">{desc}</p>
        {progress && <Progress value={progress} />}
      </CardContent>
    </Card>
  );
}
