import { useGetDashboardQuery } from '../services/api';

const DashboardPage = () => {
  const { data, isLoading } = useGetDashboardQuery();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-100 p-4 rounded shadow">Incoming: ₹{data.totalIncoming}</div>
          <div className="bg-red-100 p-4 rounded shadow">Outgoing: ₹{data.totalOutgoing}</div>
        </div>
      )}
    </div>
  );
};
export default DashboardPage;