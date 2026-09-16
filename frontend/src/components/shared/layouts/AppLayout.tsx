"use client";

import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../sidebar/Sidebar";
import Header from "../Header/Header";

const AppLayout = () => {
  // Default = Collapsed
  const [collapsed, setCollapsed] = useState(true);

  const handleToggle = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar collapsed={collapsed} />

      <div className="flex flex-1 flex-col overflow-hidden h-screen">
        <Header collapsed={collapsed} onToggle={handleToggle} />

        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
