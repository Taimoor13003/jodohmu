"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { user, role } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {user.displayName}!</p>
      <p>Your role is: <strong>{role}</strong></p>

      <div className="mt-8">
        {role === "candidate" && (
          <div>
            <h2 className="text-xl font-semibold">Your Profile</h2>
            <p>This is where you'll create and manage your profile.</p>
            <Button asChild className="mt-4">
              <Link href="/profile/create">Create Profile</Link>
            </Button>
          </div>
        )}
        {role === "worker" && (
          <div>
            <h2 className="text-xl font-semibold">Manage Profiles</h2>
            <p>This is where you'll manage candidate profiles and find matches.</p>
            <Button asChild className="mt-4">
              <Link href="/profiles">View Profiles</Link>
            </Button>
          </div>
        )}
        {role === "admin" && (
          <div>
            <h2 className="text-xl font-semibold">Admin Dashboard</h2>
            <p>This is where you'll manage the entire application.</p>
            <Button asChild className="mt-4">
              <Link href="/profiles">View Profiles</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
