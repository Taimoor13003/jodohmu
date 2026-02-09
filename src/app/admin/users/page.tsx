"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/firebase";

type Role = "admin" | "worker" | "candidate";

export default function AdminCreateUserPage() {
  const router = useRouter();
  const { role } = useAuth();
  const [formRole, setFormRole] = useState<Role>("candidate");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const [basic, setBasic] = useState({
    name: "",
    email: "",
    password: "",
    note: "",
  });

  const [details, setDetails] = useState({
    phone: "",
    location: "",
    occupation: "",
    business: "",
    income: "",
    maritalTimeline: "",
    personality: "",
    religiousPractice: "",
    familyInvolvement: "",
    preferences: "",
    history: "",
  });

  if (role !== "admin") {
    return (
      <div className="container mx-auto max-w-3xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Unauthorized</CardTitle>
          </CardHeader>
          <CardContent>You need admin access to create users.</CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const current = auth.currentUser;
      if (!current) throw new Error("Not authenticated");
      const token = await current.getIdToken();

      const payload =
        formRole === "candidate"
          ? {
              role: formRole,
              name: basic.name,
              email: basic.email,
              password: basic.password,
              details: {
                phone: details.phone,
                location: details.location,
                occupation: details.occupation,
                business: details.business,
                income: details.income,
                maritalTimeline: details.maritalTimeline,
                personality: details.personality,
                religiousPractice: details.religiousPractice,
                familyInvolvement: details.familyInvolvement,
                preferences: details.preferences,
                history: details.history,
                note: basic.note,
              },
            }
          : {
              role: formRole,
              name: basic.name,
              email: basic.email,
              password: basic.password,
              details: { note: basic.note },
            };

      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create user");
      }

      setStatus("success");
      setBasic({ name: "", email: "", password: "", note: "" });
      setDetails({
        phone: "",
        location: "",
        occupation: "",
        business: "",
        income: "",
        maritalTimeline: "",
        personality: "",
        religiousPractice: "",
        familyInvolvement: "",
        preferences: "",
        history: "",
      });
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unexpected error");
    }
  };

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0b3a86]">Create User</h1>
        <p className="text-muted-foreground">
          Admin-only: add new users with roles. Candidates require full intake details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0b3a86]">Role</label>
                <Select value={formRole} onValueChange={(value) => setFormRole(value as Role)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="candidate">Candidate</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0b3a86]">Name</label>
                <Input
                  value={basic.name}
                  onChange={(e) => setBasic({ ...basic, name: e.target.value })}
                  required
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0b3a86]">Email</label>
                <Input
                  type="email"
                  value={basic.email}
                  onChange={(e) => setBasic({ ...basic, email: e.target.value })}
                  required
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0b3a86]">Password</label>
                <Input
                  type="password"
                  value={basic.password}
                  onChange={(e) => setBasic({ ...basic, password: e.target.value })}
                  required
                  placeholder="Temporary password"
                />
              </div>
            </div>

            {formRole === "candidate" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0b3a86]">Phone / WhatsApp</label>
                  <Input
                    value={details.phone}
                    onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                    placeholder="+62..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0b3a86]">Location</label>
                  <Input
                    value={details.location}
                    onChange={(e) => setDetails({ ...details, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0b3a86]">Occupation</label>
                  <Input
                    value={details.occupation}
                    onChange={(e) => setDetails({ ...details, occupation: e.target.value })}
                    placeholder="Job title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0b3a86]">Business</label>
                  <Input
                    value={details.business}
                    onChange={(e) => setDetails({ ...details, business: e.target.value })}
                    placeholder="Business details"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0b3a86]">Income / Financial readiness</label>
                  <Input
                    value={details.income}
                    onChange={(e) => setDetails({ ...details, income: e.target.value })}
                    placeholder="Income range or readiness"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0b3a86]">Marriage timeline</label>
                  <Input
                    value={details.maritalTimeline}
                    onChange={(e) => setDetails({ ...details, maritalTimeline: e.target.value })}
                    placeholder="e.g., within 6 months"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-[#0b3a86]">Personality</label>
                  <Textarea
                    value={details.personality}
                    onChange={(e) => setDetails({ ...details, personality: e.target.value })}
                    placeholder="Personality notes"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-[#0b3a86]">Religious practice</label>
                  <Textarea
                    value={details.religiousPractice}
                    onChange={(e) => setDetails({ ...details, religiousPractice: e.target.value })}
                    placeholder="Faith practices, observance"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-[#0b3a86]">Family involvement</label>
                  <Textarea
                    value={details.familyInvolvement}
                    onChange={(e) => setDetails({ ...details, familyInvolvement: e.target.value })}
                    placeholder="Family expectations, involvement"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-[#0b3a86]">Preferences</label>
                  <Textarea
                    value={details.preferences}
                    onChange={(e) => setDetails({ ...details, preferences: e.target.value })}
                    placeholder="Partner preferences"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-[#0b3a86]">Profile history / notes</label>
                  <Textarea
                    value={details.history}
                    onChange={(e) => setDetails({ ...details, history: e.target.value })}
                    placeholder="Internal notes, history"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0b3a86]">Note</label>
                <Textarea
                  value={basic.note}
                  onChange={(e) => setBasic({ ...basic, note: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={status === "loading"}
              className="rounded-full bg-gradient-to-r from-[#9B2242] to-[#0b3a86] px-6 py-3 text-white"
            >
              {status === "loading" ? "Creating..." : "Create user"}
            </Button>

            {status === "success" && (
              <p className="text-sm font-semibold text-[#0b3a86]">User created successfully.</p>
            )}
            {status === "error" && error && (
              <p className="text-sm font-semibold text-[#9B2242]">{error}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
