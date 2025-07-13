import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetParticularQuery, useGetTransactionsQuery } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, DollarSign, TrendingUp, TrendingDown, User } from 'lucide-react';

const ParticularDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [transactionFlow, setTransactionFlow] = useState('all');
  
  const { data: transactionsData, isLoading } = useGetTransactionsQuery(id!);
  const {data:particularData,isLoading:particularLoading} = useGetParticularQuery(id!);
  
  const transactions = transactionsData?.transactions || [];
  const particular = particularData;

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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/particulars')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Particulars
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                {particular?.name || 'Particular Details'}
              </h1>
            </div>
            <Button onClick={() => navigate(`/particulars/${id}/transactions/new`)}>
              Add Transaction
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Particular Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Incoming</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{particular?.totalIncoming?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">Total incoming transactions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Outgoing</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{particular?.totalOutgoing?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">Total outgoing transactions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{particular?.totalAssets?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">Metal assets value</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cash</CardTitle>
                  <User className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{particular?.totalCash?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">Cash balance</p>
                </CardContent>
              </Card>
            </div>

            {/* Particular Details */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              {particularLoading ? (
                <div className="text-center py-8">Loading particular details...</div>
              ) : (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Name</h3>
                    <p className="text-gray-600">{particular?.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Contact Number</h3>
                    <p className="text-gray-600">{particular?.contactNumber}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Address</h3>
                    <p className="text-gray-600">{particular?.address}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Identity Document</h3>
                    <p className="text-gray-600">{particular?.identityDocument}</p>
                  </div>
                </div>
              </CardContent>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Search & Filter Transactions</CardTitle>
                <CardDescription>Find specific transactions for this client</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={transactionType} onValueChange={setTransactionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Transaction Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="metal">Metal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={transactionFlow} onValueChange={setTransactionFlow}>
                    <SelectTrigger>
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
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  Showing {filteredTransactions.length} of {transactions.length} transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading transactions...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Flow</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Total</TableHead>
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
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>{transaction.quantity}</TableCell>
                          <TableCell>₹{transaction.rate?.toLocaleString()}</TableCell>
                          <TableCell className="font-medium">₹{transaction.total?.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No transactions found</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ParticularDetailsPage; 