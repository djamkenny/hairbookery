
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const StylistClientsTab = () => {
  // Sample data - would be replaced with real data from API/database
  const clients = [
    { 
      id: 1, 
      name: "Emma Johnson", 
      email: "emma.j@example.com", 
      phone: "555-123-4567", 
      visits: 8, 
      lastVisit: "June 10, 2023" 
    },
    { 
      id: 2, 
      name: "Michael Smith", 
      email: "michael.s@example.com", 
      phone: "555-234-5678", 
      visits: 3, 
      lastVisit: "July 5, 2023" 
    },
    { 
      id: 3, 
      name: "Sophia Davis", 
      email: "sophia.d@example.com", 
      phone: "555-345-6789", 
      visits: 12, 
      lastVisit: "July 1, 2023" 
    },
    { 
      id: 4, 
      name: "James Wilson", 
      email: "james.w@example.com", 
      phone: "555-456-7890", 
      visits: 5, 
      lastVisit: "June 25, 2023" 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Clients</h1>
        
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clients..."
            className="pl-8 w-full sm:w-[250px]"
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total Visits</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.visits}</TableCell>
                  <TableCell>{client.lastVisit}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm">Book</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StylistClientsTab;
