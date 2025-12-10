import UserNavbar from "./UserNavbar";
import UserSidebar from "./UserSidebar";

const PageContainer = ({ children, activePage, title, subtitle, actions }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <UserNavbar />
      <UserSidebar active={activePage} />

      <main className="ml-64 pt-20 px-6 py-8">
        <div className="max-w-7xl mt-3">
          {(title || actions) && (
            <div className="mb-8 flex justify-between items-start">
              <div>
                {title && (
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {title}
                  </h1>
                )}
                {subtitle && <p className="text-gray-600">{subtitle}</p>}
              </div>
              {actions && <div className="flex gap-3">{actions}</div>}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};

export default PageContainer;
