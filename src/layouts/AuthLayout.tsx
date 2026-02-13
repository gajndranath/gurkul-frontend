import type { ReactNode } from "react";

const AuthLayout: React.FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-6 selection:bg-blue-100 selection:text-blue-900">
      {/* Container with premium 32px corners and soft registry shadow */}
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
