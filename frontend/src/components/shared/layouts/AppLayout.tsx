"use client";

import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../sidebar/Sidebar";
import Header from "../Header/Header";

const AppLayout = () => {
  // Default = Collapsed (closed on mobile, icon rail on desktop)
  const [collapsed, setCollapsed] = useState(true);

  const handleToggle = () => {
    setCollapsed((prev) => !prev);
  };

  const handleCloseMobile = () => {
    setCollapsed(true);
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#090B0F] text-[#F8FAFC]">
      <Sidebar collapsed={collapsed} onCloseMobile={handleCloseMobile} />

      <div className="flex flex-1 flex-col overflow-hidden h-[100dvh] min-w-0">
        <Header collapsed={collapsed} onToggle={handleToggle} />

        <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
