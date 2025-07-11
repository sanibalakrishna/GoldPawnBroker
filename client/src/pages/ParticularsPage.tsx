import { useGetParticularsQuery } from '../services/api';

const ParticularsPage = () => {
  const { data, isLoading } = useGetParticularsQuery({});

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Particulars</h2>
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Contact</th>
            <th className="border p-2">Assets</th>
            <th className="border p-2">Cash</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
          ) : (
            data?.map((p: any) => (
              <tr key={p.id} className="border">
                <td className="border p-2">{p.name}</td>
                <td className="border p-2">{p.contactNumber}</td>
                <td className="border p-2">₹{p.totalAssets}</td>
                <td className="border p-2">₹{p.totalCash}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ParticularsPage;
