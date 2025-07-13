import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetParticularsQuery, useDeleteParticularMutation } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ParticularsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Particulars"
        showBackButton={true}
        backTo="/"
        rightAction={{
          label: "Add New Particular",
          onClick: () => navigate('/particulars/new'),
          icon: <Plus className="h-4 w-4" />
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Search and Filters */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Search & Filter</CardTitle>
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

        {/* Particulars Table */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">All Particulars</CardTitle>
            <CardDescription>
              Showing {particulars.length} of {pagination?.total || 0} clients
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 sm:pt-6">
            {isLoading ? (
              <div className="text-center py-8">Loading particulars...</div>
            ) : (
              <>
                {/* Mobile List View */}
                <div className="space-y-3 sm:hidden">
                  {particulars.map((particular: any) => (
                    <div 
                      key={particular._id || particular.id}
                      className="bg-white border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => navigate(`/particulars/${particular._id || particular.id}`)}
                        >
                          <h3 className="font-semibold text-gray-900">{particular.name}</h3>
                          <p className="text-sm text-gray-600">{particular.contactNumber}</p>
                          <p className="text-xs text-gray-500 mt-1 truncate">{particular.address}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`text-right ${particular.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <div className="font-semibold">₹{particular.netPosition?.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">Net Position</div>
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
                          <TableHead className="min-w-[150px] hidden md:table-cell">Address</TableHead>
                          <TableHead className="min-w-[100px]">Total Assets</TableHead>
                          <TableHead className="min-w-[100px]">Total Cash</TableHead>
                          <TableHead className="min-w-[100px]">Net Position</TableHead>
                          <TableHead className="min-w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {particulars.map((particular: any) => (
                          <TableRow key={particular._id || particular.id}>
                            <TableCell className="font-medium">{particular.name}</TableCell>
                            <TableCell>{particular.contactNumber}</TableCell>
                            <TableCell className="max-w-xs truncate hidden md:table-cell">{particular.address}</TableCell>
                            <TableCell>₹{particular.totalAssets?.toLocaleString()}</TableCell>
                            <TableCell>₹{particular.totalCash?.toLocaleString()}</TableCell>
                            <TableCell className={particular.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}>
                              ₹{particular.netPosition?.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
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
                </div>

                {particulars.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No particulars found</div>
                )}

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
                    <div className="text-sm text-gray-700">
                      Showing page {pagination.page} of {pagination.pages}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page <= 1}
                        onClick={() => setCurrentPage(pagination.page - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page >= pagination.pages}
                        onClick={() => setCurrentPage(pagination.page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Particular"
        description={`Are you sure you want to delete "${selectedParticular?.name}"? This action cannot be undone and will also delete all associated transactions.`}
        isLoading={deleting}
      />
    </div>
  );
};

export default ParticularsPage;
