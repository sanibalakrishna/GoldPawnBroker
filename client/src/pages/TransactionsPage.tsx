import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTransactionsQuery, useDeleteTransactionMutation } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, IndianRupee, TrendingUp, TrendingDown, Edit, Trash2, MoreHorizontal, Calendar, User } from 'lucide-react';
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

const TransactionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [transactionFlow, setTransactionFlow] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  
  const { data: transactionsData, isLoading } = useGetTransactionsQuery(undefined);
  const [deleteTransaction, { isLoading: deleting }] = useDeleteTransactionMutation();
  const navigate = useNavigate();
  
  const transactions = transactionsData?.transactions || [];

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;
    
    try {
      await deleteTransaction(selectedTransaction._id).unwrap();
      toast.success('Transaction deleted successfully!');
      setDeleteDialogOpen(false);
      setSelectedTransaction(null);
    } catch (error: any) {
      toast.error(error.data?.error || 'Failed to delete transaction');
    }
  };

  const openDeleteDialog = (transaction: any) => {
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter((transaction: any) => {
    const matchesSearch = !searchTerm || 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.particular?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = transactionType === 'all' || transaction.transactionType === transactionType;
    const matchesFlow = transactionFlow === 'all' || transaction.transactionFlow === transactionFlow;
    
    return matchesSearch && matchesType && matchesFlow;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Transactions"
        description="Manage all financial transactions and records"
        breadcrumbs={[
          { label: "Transactions" }
        ]}
      />

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search & Filter</span>
          </CardTitle>
          <CardDescription>Find specific transactions by description, client, or type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions or clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="metal">Metal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={transactionFlow} onValueChange={setTransactionFlow}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Transaction Flow" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Flows</SelectItem>
                <SelectItem value="incoming">Incoming</SelectItem>
                <SelectItem value="outgoing">Outgoing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setTransactionType('all');
                setTransactionFlow('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <IndianRupee className="w-5 h-5" />
                <span>All Transactions</span>
              </CardTitle>
              <CardDescription>
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading transactions..." className="py-12" />
          ) : (
            <>
              {/* Mobile List View */}
              <div className="space-y-3 sm:hidden">
                {filteredTransactions.map((transaction: any) => (
                  <div 
                    key={transaction._id}
                    className="bg-muted/30 border rounded-xl p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{transaction.description}</h3>
                        <p className="text-sm text-muted-foreground">{transaction.particular?.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                      <div className={`text-right ${transaction.transactionFlow === 'incoming' ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="font-semibold">₹{transaction.amount?.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground capitalize">{transaction.transactionFlow}</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="capitalize">{transaction.transactionType}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/particulars/${transaction.particular?._id}/transactions/${transaction._id}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(transaction)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Flow</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction: any) => (
                      <TableRow key={transaction._id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{transaction.description}</TableCell>
                        <TableCell>{transaction.particular?.name}</TableCell>
                        <TableCell className="capitalize">{transaction.transactionType}</TableCell>
                        <TableCell className="capitalize">{transaction.transactionFlow}</TableCell>
                        <TableCell className={transaction.transactionFlow === 'incoming' ? 'text-green-600' : 'text-red-600'}>
                          ₹{transaction.amount?.toLocaleString()}
                        </TableCell>
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/particulars/${transaction.particular?._id}/transactions/${transaction._id}/edit`)}
                            >
                              Edit
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => openDeleteDialog(transaction)}
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
          
          {filteredTransactions.length === 0 && !isLoading && (
            <EmptyState
              icon={<IndianRupee />}
              title="No transactions found"
              description="Get started by adding your first transaction to the system."
              action={{
                label: "Add Your First Transaction",
                onClick: () => navigate('/transactions/new'),
                icon: <IndianRupee className="w-4 h-4" />
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
        onConfirm={handleDeleteTransaction}
        title="Delete Transaction"
        description={`Are you sure you want to delete this transaction? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
};

export default TransactionsPage; 