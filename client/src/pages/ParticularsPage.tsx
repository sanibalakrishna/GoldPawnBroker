import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetParticularsQuery, useDeleteParticularMutation } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Trash2, MoreHorizontal, Users } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';
import FloatingActionButton from '@/components/FloatingActionButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ParticularsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, _setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedParticular, setSelectedParticular] = useState<any>(null);
  
  const { data, isLoading } = useGetParticularsQuery({ search: searchTerm, page: currentPage });
  const [deleteParticular, { isLoading: deleting }] = useDeleteParticularMutation();
  const navigate = useNavigate();

  const particulars = data?.particulars || [];
  const pagination = data?.pagination;

  const handleDelete = async () => {
    if (!selectedParticular) return;
    
    try {
      await deleteParticular(selectedParticular._id || selectedParticular.id).unwrap();
      toast.success('Particular deleted successfully!');
      setDeleteDialogOpen(false);
      setSelectedParticular(null);
    } catch (error: any) {
      toast.error(error.data?.error || 'Failed to delete particular');
    }
  };

  const openDeleteDialog = (particular: any) => {
    setSelectedParticular(particular);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Particulars"
        description="Manage your clients and their financial records"
        breadcrumbs={[
          { label: "Particulars" }
        ]}
        actions={[
          {
            label: "Add New Client",
            onClick: () => navigate('/particulars/new'),
            icon: <Plus className="w-4 h-4" />
          }
        ]}
      />

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search & Filter</span>
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

      {/* Particulars Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>All Particulars</span>
              </CardTitle>
              <CardDescription>
                Showing {particulars.length} of {pagination?.total || 0} clients
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading particulars..." className="py-12" />
          ) : (
            <>
              {/* Mobile List View */}
              <div className="space-y-3 sm:hidden">
                {particulars.map((particular: any) => (
                  <div 
                    key={particular._id || particular.id}
                    className="bg-muted/30 border rounded-xl p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => navigate(`/particulars/${particular._id || particular.id}`)}
                      >
                        <h3 className="font-semibold text-foreground">{particular.name}</h3>
                        <p className="text-sm text-muted-foreground">{particular.contactNumber}</p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{particular.address}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`text-right ${particular.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <div className="font-semibold">₹{particular.netPosition?.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Net Position</div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/particulars/${particular._id || particular.id}`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/particulars/${particular._id || particular.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(particular)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                      <TableHead className="hidden md:table-cell">Address</TableHead>
                      <TableHead>Total Assets</TableHead>
                      <TableHead>Total Cash</TableHead>
                      <TableHead>Net Position</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {particulars.map((particular: any) => (
                      <TableRow key={particular._id || particular.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{particular.name}</TableCell>
                        <TableCell>{particular.contactNumber}</TableCell>
                        <TableCell className="max-w-xs truncate hidden md:table-cell">{particular.address}</TableCell>
                        <TableCell>₹{particular.totalAssets?.toLocaleString()}</TableCell>
                        <TableCell>₹{particular.totalCash?.toLocaleString()}</TableCell>
                        <TableCell className={particular.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ₹{particular.netPosition?.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/particulars/${particular._id || particular.id}`)}
                            >
                              View
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/particulars/${particular._id || particular.id}/edit`)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => openDeleteDialog(particular)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
          
          {particulars.length === 0 && !isLoading && (
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Particular"
        description={`Are you sure you want to delete "${selectedParticular?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
};

export default ParticularsPage;
