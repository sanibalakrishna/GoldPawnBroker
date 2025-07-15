import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetParticularQuery, useCreateParticularMutation, useUpdateParticularMutation } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { User } from 'lucide-react';

const AddEditParticularPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    address: '',
    identityDocument: ''
  });

  const { data: particularData, isLoading: loadingParticular } = useGetParticularQuery(id!, {
    skip: !isEditing
  });

  const [createParticular, { isLoading: creating }] = useCreateParticularMutation();
  const [updateParticular, { isLoading: updating }] = useUpdateParticularMutation();

  useEffect(() => {
    if (isEditing && particularData) {
      setFormData({
        name: particularData.name || '',
        contactNumber: particularData.contactNumber || '',
        address: particularData.address || '',
        identityDocument: particularData.identityDocument || ''
      });
    }
  }, [isEditing, particularData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        await updateParticular({ id: id!, ...formData }).unwrap();
        toast.success('Particular updated successfully!');
      } else {
        await createParticular(formData).unwrap();
        toast.success('Particular created successfully!');
      }
      navigate('/particulars');
    } catch (error: any) {
      toast.error(error.data?.error || 'Failed to save particular');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isEditing && loadingParticular) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/*<Header 
          title="Edit Particular"
          showBackButton={true}
          backTo="/particulars"
        />*/}
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center py-8">Loading particular details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/*<Header 
        title={isEditing ? "Edit Particular" : "Add New Particular"}
        showBackButton={true}
        backTo="/particulars"
        rightAction={{
          label: "Save",
          onClick: () => handleSubmit(new Event('submit') as any),
          icon: <Save className="h-4 w-4" />
        }}
      />*/}

      <div className="max-w-2xl mx-auto px-4 py-4 sm:py-8">
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl flex items-center">
              <User className="h-5 w-5 mr-2" />
              {isEditing ? 'Edit Client Information' : 'New Client Information'}
            </CardTitle>
            <CardDescription className="hidden sm:block">
              {isEditing ? 'Update the client details below' : 'Enter the client details below'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 sm:pt-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="h-12 sm:h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber" className="text-sm font-medium">
                  Contact Number *
                </Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  placeholder="Enter contact number"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  required
                  className="h-12 sm:h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Address
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter complete address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="min-h-[80px] sm:min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="identityDocument" className="text-sm font-medium">
                  Identity Document
                </Label>
                <Input
                  id="identityDocument"
                  type="text"
                  placeholder="Aadhar, PAN, or other ID"
                  value={formData.identityDocument}
                  onChange={(e) => handleInputChange('identityDocument', e.target.value)}
                  className="h-12 sm:h-10"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={creating || updating}
                  className="h-12 sm:h-10 flex-1"
                >
                  {creating || updating ? 'Saving...' : (isEditing ? 'Update Particular' : 'Create Particular')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/particulars')}
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

export default AddEditParticularPage; 