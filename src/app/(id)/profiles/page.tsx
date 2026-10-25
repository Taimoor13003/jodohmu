"use client";

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/context/AuthContext';

interface Profile {
  id: number;
  name: string;
  age: number;
  gender: string;
  education: string;
  occupation: string;
  sect: string;
  praying: boolean;
}

export default function ProfilesPage() {
  const { role } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [filters, setFilters] = useState({ name: '', gender: '', sect: '' });

  useEffect(() => {
    const fetchProfiles = async () => {
      const response = await fetch('/api/profiles');
      const data = await response.json();
      setProfiles(data);
      setFilteredProfiles(data);
    };

    fetchProfiles();
  }, []);

  useEffect(() => {
    let updatedProfiles = profiles;

    if (filters.name) {
      updatedProfiles = updatedProfiles.filter(p => p.name.toLowerCase().includes(filters.name.toLowerCase()));
    }

    if (filters.gender) {
      updatedProfiles = updatedProfiles.filter(p => p.gender === filters.gender);
    }

    if (filters.sect) {
      updatedProfiles = updatedProfiles.filter(p => p.sect.toLowerCase().includes(filters.sect.toLowerCase()));
    }

    setFilteredProfiles(updatedProfiles);
  }, [filters, profiles]);

  if (role !== 'worker' && role !== 'admin') {
    return <div>You are not authorized to view this page.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profiles</h1>
      <div className="flex space-x-4 mb-4">
        <Input
          placeholder="Filter by name..."
          onChange={e => setFilters({ ...filters, name: e.target.value })}
        />
        <Select onValueChange={value => setFilters({ ...filters, gender: value })}>
          <SelectTrigger><SelectValue placeholder="Filter by gender" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Filter by sect..."
          onChange={e => setFilters({ ...filters, sect: e.target.value })}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Education</TableHead>
            <TableHead>Occupation</TableHead>
            <TableHead>Sect</TableHead>
            <TableHead>Prays 5x</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProfiles.map(profile => (
            <TableRow key={profile.id}>
              <TableCell>{profile.name}</TableCell>
              <TableCell>{profile.age}</TableCell>
              <TableCell>{profile.gender}</TableCell>
              <TableCell>{profile.education}</TableCell>
              <TableCell>{profile.occupation}</TableCell>
              <TableCell>{profile.sect}</TableCell>
              <TableCell>{profile.praying ? 'Yes' : 'No'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
