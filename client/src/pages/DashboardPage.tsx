import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetDashboardQuery, useGetParticularsQuery } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, IndianRupee, TrendingUp, TrendingDown, Plus, ArrowRight } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';
import FloatingActionButton from '@/components/FloatingActionButton';

const DashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: dashboardData } = useGetDashboardQuery(undefined);
  const { data: particularsData, isLoading: particularsLoading } = useGetParticularsQuery({ search: searchTerm, page: 1 });
  const navigate = useNavigate();

  const overview = dashboardData?.overview;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your pawn broker business.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Incoming"
          value={`₹${overview?.totalIncoming?.toLocaleString() || '0'}`}
          description="Total incoming transactions"
          icon={<TrendingUp />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />

        <StatsCard
          title="Outgoing"
          value={`₹${overview?.totalOutgoing?.toLocaleString() || '0'}`}
          description="Total outgoing transactions"
          icon={<TrendingDown />}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
        />

        <StatsCard
          title="Net Position"
          value={`₹${overview?.netPosition?.toLocaleString() || '0'}`}
          description="Current net position"
          icon={<IndianRupee />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          className={(overview?.netPosition || 0) >= 0 ? '' : 'text-red-600'}
        />

        <StatsCard
          title="Clients"
          value={overview?.totalParticulars || '0'}
          description="Active clients"
          icon={<Users />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Search and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Search Particulars</span>
            </CardTitle>
            <CardDescription>Find specific clients by name or contact number</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => navigate('/particulars/new')}
              className="w-full justify-start h-12"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Client
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/particulars')}
              className="w-full justify-start h-12"
            >
              <Users className="w-4 h-4 mr-2" />
              View All Clients
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Particulars */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Particulars</CardTitle>
            <CardDescription>Your most recent clients and their details</CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/particulars')}
            className="hidden sm:flex"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardHeader>
        <CardContent>
          {particularsLoading ? (
            <LoadingSpinner size="lg" text="Loading particulars..." className="py-12" />
          ) : (
            <>
              {/* Mobile List View */}
              <div className="space-y-3 sm:hidden">
                {particularsData?.particulars?.slice(0, 5).map((particular: any) => (
                  <div 
                    key={particular._id || particular.id}
                    className="bg-muted/30 border rounded-xl p-4 space-y-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/particulars/${particular._id || particular.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-foreground">{particular.name}</h3>
                        <p className="text-sm text-muted-foreground">{particular.contactNumber}</p>
                      </div>
                      <div className={`text-right ${particular.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="font-semibold">₹{particular.netPosition?.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Net Position</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Assets: ₹{particular.totalAssets?.toLocaleString()}</span>
                      <span>Cash: ₹{particular.totalCash?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Total Assets</TableHead>
                      <TableHead>Total Cash</TableHead>
                      <TableHead>Net Position</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {particularsData?.particulars?.slice(0, 10).map((particular: any) => (
                      <TableRow key={particular._id || particular.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{particular.name}</TableCell>
                        <TableCell>{particular.contactNumber}</TableCell>
                        <TableCell>₹{particular.totalAssets?.toLocaleString()}</TableCell>
                        <TableCell>₹{particular.totalCash?.toLocaleString()}</TableCell>
                        <TableCell className={particular.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ₹{particular.netPosition?.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
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
            </>
          )}
          {particularsData?.particulars?.length === 0 && (
            <EmptyState
              icon={<Users />}
              title="No particulars found"
              description="Get started by adding your first client to the system."
              action={{
                label: "Add Your First Client",
                onClick: () => navigate('/particulars/new'),
                icon: <Plus className="w-4 h-4" />
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
};

export default DashboardPage;