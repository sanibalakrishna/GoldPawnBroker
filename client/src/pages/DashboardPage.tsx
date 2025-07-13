import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetDashboardQuery, useGetParticularsQuery } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, DollarSign, TrendingUp, TrendingDown, List } from 'lucide-react';
import Header from '@/components/Header';

const DashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: dashboardData } = useGetDashboardQuery(undefined);
  const { data: particularsData, isLoading: particularsLoading } = useGetParticularsQuery({ search: searchTerm, page: 1 });
  const navigate = useNavigate();

  const overview = dashboardData?.overview;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Gold Pawn Broker Dashboard"
        rightAction={{
          label: "View All Particulars",
          onClick: () => navigate('/particulars'),
          icon: <List className="h-4 w-4" />
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Overview Cards - Mobile Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Incoming</span>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-lg sm:text-2xl font-bold">₹{overview?.totalIncoming?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">Total incoming transactions</p>
          </Card>

          <Card className="p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Outgoing</span>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-lg sm:text-2xl font-bold">₹{overview?.totalOutgoing?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">Total outgoing transactions</p>
          </Card>

          <Card className="p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Net Position</span>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <div className={`text-lg sm:text-2xl font-bold ${(overview?.netPosition || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{overview?.netPosition?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">Current net position</p>
          </Card>

          <Card className="p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Clients</span>
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-lg sm:text-2xl font-bold">{overview?.totalParticulars || '0'}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">Active clients</p>
          </Card>
        </div>

        {/* Search Section */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Search Particulars</CardTitle>
            <CardDescription className="hidden sm:block">Find specific clients by name or contact number</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 sm:pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 sm:h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Particulars List */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Recent Particulars</CardTitle>
            <CardDescription className="hidden sm:block">Your most recent clients and their details</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 sm:pt-6">
            {particularsLoading ? (
              <div className="text-center py-8">Loading particulars...</div>
            ) : (
              <>
                {/* Mobile List View */}
                <div className="space-y-3 sm:hidden">
                  {particularsData?.particulars?.slice(0, 10).map((particular: any) => (
                    <div 
                      key={particular._id || particular.id}
                      className="bg-white border rounded-lg p-4 space-y-2"
                      onClick={() => navigate(`/particulars/${particular._id || particular.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{particular.name}</h3>
                          <p className="text-sm text-gray-600">{particular.contactNumber}</p>
                        </div>
                        <div className={`text-right ${particular.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <div className="font-semibold">₹{particular.netPosition?.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Net Position</div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Assets: ₹{particular.totalAssets?.toLocaleString()}</span>
                        <span>Cash: ₹{particular.totalCash?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <div className="min-w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[120px]">Name</TableHead>
                          <TableHead className="min-w-[120px]">Contact</TableHead>
                          <TableHead className="min-w-[100px]">Total Assets</TableHead>
                          <TableHead className="min-w-[100px]">Total Cash</TableHead>
                          <TableHead className="min-w-[100px]">Net Position</TableHead>
                          <TableHead className="min-w-[100px]">Actions</TableHead>
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
                  </div>
                </div>
              </>
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