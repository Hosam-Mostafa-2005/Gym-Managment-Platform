// src/features/members-management/components/MembersList.tsx
import React from "react";
import { MemberCard } from "./MemberCard";
import type { MemberManagementCard } from "../../members-management/types/members-management.types";

interface MembersListProps {
  members: MemberManagementCard[];
}

export const MembersList: React.FC<MembersListProps> = ({ members }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
      {members.map((member) => (
        <MemberCard key={member.member.id} data={member} />
      ))}
    </div>
  );
};
