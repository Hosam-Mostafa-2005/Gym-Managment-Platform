"use client";

import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import Header from "../Header/Header";
import { useState } from "react";

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={collapsed} />

      {/* 
        ✅ شلنا من هنا px-6 py-4 gap-6 عشان الـ Header يمتد من أول البوردر للآخر فوق
      */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <Header onToggle={() => setCollapsed(!collapsed)} />

        {/* 
          ✅ حطينا الـ Padding هنا على الـ main بس، عشان محتوى الصفحة يفضل واخد مسافات مريحة
        */}
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
