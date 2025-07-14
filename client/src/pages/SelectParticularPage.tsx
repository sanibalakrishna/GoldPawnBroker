import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetParticularsQuery } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';

const SelectParticularPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { data: particularsData, isLoading } = useGetParticularsQuery({ search: searchTerm, page: 1 });

  const handleSelectParticular = (particularId: string) => {
    navigate(`/particulars/${particularId}/transactions/new`);
  };

  const handleCreateNewParticular = () => {
    navigate('/particulars/new');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Select Client"
        description="Choose a client to add a transaction for"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Select Client" }
        ]}
      />

      {/* Search and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Search Clients</span>
            </CardTitle>
            <CardDescription>Find the client you want to add a transaction for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or contact number..."
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
            <CardDescription>Create a new client if needed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleCreateNewParticular}
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
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full justify-start h-12"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Clients</CardTitle>
          <CardDescription>
            {particularsData?.particulars?.length || 0} clients found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading clients..." className="py-12" />
          ) : (
            <>
              {/* Mobile List View */}
              <div className="space-y-3 sm:hidden">
                {particularsData?.particulars?.map((particular: any) => (
                  <div 
                    key={particular._id || particular.id}
                    className="bg-muted/30 border rounded-xl p-4 space-y-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSelectParticular(particular._id || particular.id)}
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
                    <div className="text-xs text-muted-foreground">
                      {particular.address}
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
                      <TableHead>Address</TableHead>
                      <TableHead>Total Assets</TableHead>
                      <TableHead>Total Cash</TableHead>
                      <TableHead>Net Position</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {particularsData?.particulars?.map((particular: any) => (
                      <TableRow 
                        key={particular._id || particular.id} 
                        className="hover:bg-muted/30 cursor-pointer"
                        onClick={() => handleSelectParticular(particular._id || particular.id)}
                      >
                        <TableCell className="font-medium">{particular.name}</TableCell>
                        <TableCell>{particular.contactNumber}</TableCell>
                        <TableCell className="max-w-xs truncate">{particular.address}</TableCell>
                        <TableCell>₹{particular.totalAssets?.toLocaleString()}</TableCell>
                        <TableCell>₹{particular.totalCash?.toLocaleString()}</TableCell>
                        <TableCell className={particular.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ₹{particular.netPosition?.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectParticular(particular._id || particular.id);
                            }}
                          >
                            Select Client
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
          
          {particularsData?.particulars?.length === 0 && !isLoading && (
            <EmptyState
              icon={<Users />}
              title="No clients found"
              description={searchTerm ? `No clients match "${searchTerm}". Try a different search term or create a new client.` : "Get started by adding your first client to the system."}
              action={{
                label: searchTerm ? "Create New Client" : "Add Your First Client",
                onClick: handleCreateNewParticular,
                icon: <Plus className="w-4 h-4" />
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectParticularPage; 