import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetTransactionQuery, useCreateTransactionMutation, useUpdateTransactionMutation } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { Save, DollarSign } from 'lucide-react';

const AddEditTransactionPage = () => {
  const { id, particularId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    transactionType: 'cash',
    transactionFlow: 'incoming',
    description: '',
    quantity: '',
    rate: '',
    percentage: '',
    total: ''
  });

  const { data: transactionData, isLoading: loadingTransaction } = useGetTransactionQuery(id!, {
    skip: !isEditing
  });

  const [createTransaction, { isLoading: creating }] = useCreateTransactionMutation();
  const [updateTransaction, { isLoading: updating }] = useUpdateTransactionMutation();

  useEffect(() => {
    if (isEditing && transactionData) {
      console.log('Setting form data for editing:', transactionData);
      const newFormData = {
        transactionType: transactionData.transactionType || 'cash',
        transactionFlow: transactionData.transactionFlow || 'incoming',
        description: transactionData.description || '',
        quantity: transactionData.quantity?.toString() || '',
        rate: transactionData.rate?.toString() || '',
        percentage: transactionData.percentage?.toString() || '',
        total: transactionData.total?.toString() || ''
      };
      console.log('New form data:', newFormData);
      setFormData(newFormData);
    }
  }, [isEditing, transactionData]);

  // Recalculate total when transaction type changes
  useEffect(() => {
    const total = calculateTotal();
    setFormData(prev => ({ ...prev, total }));
  }, [formData.transactionType, formData.quantity, formData.rate, formData.percentage]);

  // Debug: Log form data changes
  useEffect(() => {
    console.log('Form data changed:', formData);
  }, [formData]);

  const calculateTotal = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const rate = parseFloat(formData.rate) || 0;
    
    if (formData.transactionType === 'metal') {
      const percentage = parseFloat(formData.percentage) || 0;
      return (quantity * rate * (percentage / 100)).toFixed(2);
    }
    
    return (quantity * rate).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const total = calculateTotal();
    const transactionData = {
      ...formData,
      quantity: parseFloat(formData.quantity),
      rate: parseFloat(formData.rate),
      percentage: formData.transactionType === 'metal' ? parseFloat(formData.percentage) : undefined,
      total: parseFloat(total),
      particularId: particularId!
    };

    try {
      if (isEditing) {
        await updateTransaction({ id: id!, ...transactionData }).unwrap();
        toast.success('Transaction updated successfully!');
      } else {
        await createTransaction(transactionData).unwrap();
        toast.success('Transaction created successfully!');
      }
      navigate(`/particulars/${particularId}`);
    } catch (error: any) {
      toast.error(error.data?.error || 'Failed to save transaction');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Validate percentage range for metal transactions
    if (field === 'percentage') {
      const numValue = parseFloat(value);
      if (numValue < 0) value = '0';
      if (numValue > 100) value = '100';
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate total when quantity, rate, or percentage changes
    if (field === 'quantity' || field === 'rate' || field === 'percentage') {
      const newQuantity = field === 'quantity' ? value : formData.quantity;
      const newRate = field === 'rate' ? value : formData.rate;
      const newPercentage = field === 'percentage' ? value : formData.percentage;
      
      const quantity = parseFloat(newQuantity) || 0;
      const rate = parseFloat(newRate) || 0;
      
      let total;
      if (formData.transactionType === 'metal') {
        const percentage = parseFloat(newPercentage) || 0;
        total = quantity * rate * (percentage / 100);
      } else {
        total = quantity * rate;
      }
      
      setFormData(prev => ({ ...prev, total: total.toFixed(2) }));
    }
  };

  if (isEditing && (loadingTransaction || !transactionData)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          title="Edit Transaction"
          showBackButton={true}
          backTo={`/particulars/${particularId}`}
        />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center py-8">Loading transaction details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={isEditing ? "Edit Transaction" : "Add New Transaction"}
        showBackButton={true}
        backTo={`/particulars/${particularId}`}
        rightAction={{
          label: "Save",
          onClick: () => handleSubmit(new Event('submit') as any),
          icon: <Save className="h-4 w-4" />
        }}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 sm:py-8">
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              {isEditing ? 'Edit Transaction' : 'New Transaction'}
            </CardTitle>
            <CardDescription className="hidden sm:block">
              {isEditing ? 'Update the transaction details below' : 'Enter the transaction details below'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 sm:pt-6">
           
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionType" className="text-sm font-medium">
                    Transaction Type *
                  </Label>
                  <Select 
                    key={`transactionType-${formData.transactionType}`}
                    value={formData.transactionType} 
                    onValueChange={(value) => handleInputChange('transactionType', value)}
                  >
                    <SelectTrigger className="h-12 sm:h-10">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="metal">Metal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionFlow" className="text-sm font-medium">
                    Transaction Flow *
                  </Label>
                  <Select 
                    key={`transactionFlow-${formData.transactionFlow}`}
                    value={formData.transactionFlow} 
                    onValueChange={(value) => handleInputChange('transactionFlow', value)}
                  >
                    <SelectTrigger className="h-12 sm:h-10">
                      <SelectValue placeholder="Select flow" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incoming">Incoming</SelectItem>
                      <SelectItem value="outgoing">Outgoing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter transaction description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  className="min-h-[80px] sm:min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-medium">
                    Quantity *
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    required
                    className="h-12 sm:h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate" className="text-sm font-medium">
                    Rate (₹) *
                  </Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.rate}
                    onChange={(e) => handleInputChange('rate', e.target.value)}
                    required
                    className="h-12 sm:h-10"
                  />
                </div>

                {formData.transactionType === 'metal' && (
                  <div className="space-y-2">
                    <Label htmlFor="percentage" className="text-sm font-medium">
                      Quality (%) *
                    </Label>
                    <Input
                      id="percentage"
                      type="number"
                      step="0.01"
                      min={0}
                      max={100}
                      placeholder="0.00"
                      value={formData.percentage}
                      onChange={(e) => handleInputChange('percentage', e.target.value)}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value);
                        if (isNaN(value)) {
                          handleInputChange('percentage', '0');
                        } else if (value < 0) {
                          handleInputChange('percentage', '0');
                        } else if (value > 100) {
                          handleInputChange('percentage', '100');
                        }
                      }}
                      required={formData.transactionType === 'metal'}
                      className="h-12 sm:h-10"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="total" className="text-sm font-medium">
                    Total (₹)
                  </Label>
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.total}
                    readOnly
                    className="h-12 sm:h-10 bg-gray-50"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={creating || updating}
                  className="h-12 sm:h-10 flex-1"
                >
                  {creating || updating ? 'Saving...' : (isEditing ? 'Update Transaction' : 'Create Transaction')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/particulars/${particularId}`)}
                  className="h-12 sm:h-10"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddEditTransactionPage; 