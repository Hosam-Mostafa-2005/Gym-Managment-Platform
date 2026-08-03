"use client";

import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import Header from "../Header/Header";
import { useState } from "react";

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* الـ Sidebar أصبح ثابت Sticky ولن يتحرك مع الـ Scroll */}
      <Sidebar collapsed={collapsed} />

      <div className="flex flex-1 flex-col overflow-x-hidden h-screen">
        <Header onToggle={() => setCollapsed(!collapsed)} />

        {/* الـ main هو الوحيد الذي سيقوم بعمل Scroll بينما الـ Sidebar والـ Header في مكانهما تماماً */}
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
