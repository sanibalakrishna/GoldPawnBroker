import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetParticularsQuery } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, ArrowLeft } from 'lucide-react';

const ParticularsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading } = useGetParticularsQuery({ search: searchTerm, page: currentPage });
  const navigate = useNavigate();

  const particulars = data?.particulars || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Particulars</h1>
            </div>
            <Button onClick={() => navigate('/particulars/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Particular
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
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

        {/* Particulars Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Particulars</CardTitle>
            <CardDescription>
              Showing {particulars.length} of {pagination?.total || 0} clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading particulars...</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Total Assets</TableHead>
                      <TableHead>Total Cash</TableHead>
                      <TableHead>Net Position</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {particulars.map((particular: any) => (
                      <TableRow key={particular._id || particular.id}>
                        <TableCell className="font-medium">{particular.name}</TableCell>
                        <TableCell>{particular.contactNumber}</TableCell>
                        <TableCell className="max-w-xs truncate">{particular.address}</TableCell>
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

                {particulars.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No particulars found</div>
                )}

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-6">
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
    </div>
  );
};

export default ParticularsPage;
