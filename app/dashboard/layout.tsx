export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">ABACO Financial Platform</h1>
            <div className="flex gap-4">
              <a
                href="/dashboard/validation"
                className="text-blue-600 hover:text-blue-800"
              >
                Validation
              </a>
              <a
                href="/dashboard/portfolio"
                className="text-gray-600 hover:text-gray-800"
              >
                Portfolio
              </a>
              <a
                href="/dashboard/analytics"
                className="text-gray-600 hover:text-gray-800"
              >
                Analytics
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
