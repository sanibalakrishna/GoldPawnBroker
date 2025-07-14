import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, IndianRupee, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FloatingActionButtonProps {
  particularId?: string;
}

const FloatingActionButton = ({ particularId }: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAddParticular = () => {
    navigate('/particulars/new');
    setIsOpen(false);
  };

  const handleAddTransaction = () => {
    if (particularId) {
      navigate(`/particulars/${particularId}/transactions/new`);
    } else {
      navigate('/transactions/new');
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Buttons */}
      {isOpen && (
        <div className="flex flex-col items-end space-y-3 mb-3">
          <Button
            onClick={handleAddParticular}
            className="h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Users className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleAddTransaction}
            className="h-12 w-12 rounded-full shadow-lg bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <IndianRupee className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Main FAB Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700"
        size="lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </Button>
    </div>
  );
};

export default FloatingActionButton; 