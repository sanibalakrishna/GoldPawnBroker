import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetParticularQuery, useGetTransactionsQuery, useDeleteTransactionMutation } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, IndianRupee, TrendingUp, TrendingDown, User, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import FloatingActionButton from '@/components/FloatingActionButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ParticularDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [transactionFlow, setTransactionFlow] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: transactionsData, isLoading } = useGetTransactionsQuery(id!);
  const {data:particularData,isLoading:particularLoading} = useGetParticularQuery(id!);
  const [deleteTransaction, { isLoading: deleting }] = useDeleteTransactionMutation();
  
  const transactions = transactionsData?.transactions || [];
  const particular = particularData;

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
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !transactionType || transactionType === 'all' || transaction.transactionType === transactionType;
    const matchesFlow = !transactionFlow || transactionFlow === 'all' || transaction.transactionFlow === transactionFlow;
    
    return matchesSearch && matchesType && matchesFlow;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/*<Header 
        title={particular?.name || 'Particular Details'}
        showBackButton={true}
        backTo="/particulars"
        rightAction={{
          label: "Add Transaction",
          onClick: () => navigate(`/particulars/${id}/transactions/new`),
          icon: <Plus className="h-4 w-4" />
        }}
      />*/}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Particular Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <Card className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">Incoming</span>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-lg sm:text-2xl font-bold">₹{particular?.totalIncoming?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground hidden sm:block">Total incoming transactions</p>
              </Card>

              <Card className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">Outgoing</span>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
                <div className="text-lg sm:text-2xl font-bold">₹{particular?.totalOutgoing?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground hidden sm:block">Total outgoing transactions</p>
              </Card>

              <Card className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">Assets</span>
                  <IndianRupee className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-lg sm:text-2xl font-bold">₹{particular?.totalAssets?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground hidden sm:block">Metal assets value</p>
              </Card>

              <Card className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">Cash</span>
                  <User className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-lg sm:text-2xl font-bold">₹{particular?.totalCash?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground hidden sm:block">Cash balance</p>
              </Card>
            </div>

            {/* Particular Details */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Client Information</CardTitle>
              </CardHeader>
              {particularLoading ? (
                <div className="text-center py-8">Loading particular details...</div>
              ) : (
              <CardContent className="pt-0 sm:pt-6">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Name</span>
                    <span className="text-gray-900">{particular?.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Contact Number</span>
                    <span className="text-gray-900">{particular?.contactNumber}</span>
                  </div>
                  <div className="py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700 block mb-1">Address</span>
                    <span className="text-gray-900">{particular?.address}</span>
                  </div>
                  <div className="py-2">
                    <span className="font-medium text-gray-700 block mb-1">Identity Document</span>
                    <span className="text-gray-900">{particular?.identityDocument}</span>
                  </div>
                </div>
              </CardContent>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 sm:space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Search & Filter Transactions</CardTitle>
                <CardDescription className="hidden sm:block">Find specific transactions for this client</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 sm:pt-6">
                <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
                  <div className="relative sm:col-span-2 lg:col-span-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 sm:h-10"
                    />
                  </div>
                  <Select value={transactionType} onValueChange={setTransactionType}>
                    <SelectTrigger className="h-12 sm:h-10">
                      <SelectValue placeholder="Transaction Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="metal">Metal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={transactionFlow} onValueChange={setTransactionFlow}>
                    <SelectTrigger className="h-12 sm:h-10">
                      <SelectValue placeholder="Transaction Flow" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Flows</SelectItem>
                      <SelectItem value="incoming">Incoming</SelectItem>
                      <SelectItem value="outgoing">Outgoing</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setTransactionType('all');
                      setTransactionFlow('all');
                    }}
                    className="h-12 sm:h-10 sm:col-span-2 lg:col-span-1"
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Transaction History</CardTitle>
                <CardDescription>
                  Showing {filteredTransactions.length} of {transactions.length} transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 sm:pt-6">
                {isLoading ? (
                  <div className="text-center py-8">Loading transactions...</div>
                ) : (
                  <>
                    {/* Mobile List View */}
                    <div className="space-y-3 sm:hidden">
                      {filteredTransactions.map((transaction: any) => (
                        <div 
                          key={transaction._id}
                          className="bg-white border rounded-lg p-4 space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {new Date(transaction.createdAt).toLocaleDateString()}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  transaction.transactionFlow === 'incoming' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {transaction.transactionFlow}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{transaction.description}</p>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Type: {transaction.transactionType}</span>
                                <span>Qty: {transaction.quantity}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-right">
                                <div className="font-semibold text-gray-900">₹{transaction.total?.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">Rate: ₹{transaction.rate?.toLocaleString()}</div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate(`/particulars/${id}/transactions/${transaction._id}/edit`)}>
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
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                      <div className="min-w-full">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[100px]">Date</TableHead>
                              <TableHead className="min-w-[80px]">Type</TableHead>
                              <TableHead className="min-w-[100px]">Flow</TableHead>
                              <TableHead className="min-w-[150px] hidden md:table-cell">Description</TableHead>
                              <TableHead className="min-w-[80px]">Quantity</TableHead>
                              <TableHead className="min-w-[100px] hidden md:table-cell">Rate</TableHead>
                              <TableHead className="min-w-[100px]">Total</TableHead>
                              <TableHead className="min-w-[100px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredTransactions.map((transaction: any) => (
                              <TableRow key={transaction._id}>
                                <TableCell>
                                  {new Date(transaction.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="capitalize">{transaction.transactionType}</TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    transaction.transactionFlow === 'incoming' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {transaction.transactionFlow}
                                  </span>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{transaction.description}</TableCell>
                                <TableCell>{transaction.quantity}</TableCell>
                                <TableCell className="hidden md:table-cell">₹{transaction.rate?.toLocaleString()}</TableCell>
                                <TableCell className="font-medium">₹{transaction.total?.toLocaleString()}</TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => navigate(`/particulars/${id}/transactions/${transaction._id}/edit`)}
                                      className="h-8 px-2"
                                    >
                                      <Edit className="h-3 w-3 mr-1" />
                                      Edit
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openDeleteDialog(transaction)}
                                      className="h-8 px-2 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Delete
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </>
                )}
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No transactions found</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteTransaction}
        title="Delete Transaction"
        description={`Are you sure you want to delete this transaction? This action cannot be undone.`}
        loading={deleting}
      />
      
      {/* Floating Action Button - only show on transactions tab */}
      {activeTab === 'transactions' && (
        <FloatingActionButton particularId={id} />
      )}
    </div>
  );
};

export default ParticularDetailsPage; 