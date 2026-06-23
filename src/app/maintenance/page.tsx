export default function MaintenancePage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-6xl mb-6">🔧</div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-4">Under Maintenance</h1>
        <p className="text-gray-400 mb-8">
          0GBomber is currently undergoing scheduled maintenance.
          Please check back soon.
        </p>
        <div className="w-full bg-dark-3 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full w-3/4 animate-pulse" />
        </div>
        <p className="text-xs text-gray-500 mt-4">Maintenance in progress...</p>
      </div>
    </div>
  );
}
