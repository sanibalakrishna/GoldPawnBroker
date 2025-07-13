import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetDashboardQuery, useGetParticularsQuery } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const DashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: dashboardData, isLoading: dashboardLoading } = useGetDashboardQuery(undefined);
  const { data: particularsData, isLoading: particularsLoading } = useGetParticularsQuery({ search: searchTerm, page: 1 });
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const overview = dashboardData?.overview;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Gold Pawn Broker Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/particulars')}>
                View All Particulars
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Incoming</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{overview?.totalIncoming?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">Total incoming transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outgoing</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{overview?.totalOutgoing?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">Total outgoing transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Position</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(overview?.netPosition || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{overview?.netPosition?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">Current net position</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Particulars</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.totalParticulars || '0'}</div>
              <p className="text-xs text-muted-foreground">Active clients</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Particulars</CardTitle>
            <CardDescription>Find specific clients by name or contact number</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or contact number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Particulars List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Particulars</CardTitle>
            <CardDescription>Your most recent clients and their details</CardDescription>
          </CardHeader>
          <CardContent>
            {particularsLoading ? (
              <div className="text-center py-8">Loading particulars...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Total Assets</TableHead>
                    <TableHead>Total Cash</TableHead>
                    <TableHead>Net Position</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {particularsData?.particulars?.slice(0, 10).map((particular: any) => (
                    <TableRow key={particular._id || particular.id}>
                      <TableCell className="font-medium">{particular.name}</TableCell>
                      <TableCell>{particular.contactNumber}</TableCell>
                      <TableCell>₹{particular.totalAssets?.toLocaleString()}</TableCell>
                      <TableCell>₹{particular.totalCash?.toLocaleString()}</TableCell>
                      <TableCell className={particular.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ₹{particular.netPosition?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/particulars/${particular._id || particular.id}`)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {particularsData?.particulars?.length === 0 && (
              <div className="text-center py-8 text-gray-500">No particulars found</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;