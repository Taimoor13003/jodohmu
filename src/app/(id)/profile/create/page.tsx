"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";

export default function CreateProfilePage() {
  const { role } = useAuth();

  if (role !== 'candidate') {
    return <div>You are not authorized to view this page.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Your Profile</h1>
      <form className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Personal Details</h2>
          <Input placeholder="Full Name" />
          <Input placeholder="Age" type="number" />
          <Select>
            <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
          <Textarea placeholder="About Me" />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Education & Career</h2>
          <Input placeholder="Highest Education" />
          <Input placeholder="Occupation" />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Religious Background</h2>
          <Input placeholder="Sect" />
          <div className="flex items-center space-x-2">
            <Checkbox id="praying" />
            <label htmlFor="praying">Do you pray 5 times a day?</label>
          </div>
        </div>

        <Button type="submit">Create Profile</Button>
      </form>
    </div>
  );
}
