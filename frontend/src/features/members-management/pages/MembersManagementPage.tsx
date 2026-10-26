// src/features/members-management/pages/MembersManagementPage.tsx
import React, { useCallback, useState } from "react";
import { useMembersManagement } from "../hooks/use-members-management";
import { MembersHeader } from "../components/MembersHeader";
import { MembersToolbar } from "../components/MembersToolbar";
import { MembersList } from "../components/MembersList";
import { MembersPagination } from "../components/MembersPagination";
import { MembersLoading } from "../components/states/MembersLoading";
import { MembersError } from "../components/states/MembersError";
import { MembersEmpty } from "../components/states/MembersEmpty";
import { InviteMemberDialog } from "../../coaching-relationships/components/InviteMemberDialog";
import { PendingInvitationsList } from "../../coaching-relationships/components/PendingInvitationsList";
import type { MembersManagementQuery } from "../types/members-management.types";

const MembersManagementPage: React.FC = () => {
  // Local state for all query parameters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const limit = 12; // Static limit based on 3-column grid design

  const queryParams: MembersManagementQuery = {
    search: search || undefined,
    status: status || undefined,
    sort: sort || undefined,
    page,
    limit,
  };

  const { data, isLoading, isError, error, refetch } =
    useMembersManagement(queryParams);

  // Reset to page 1 when filters change
  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((val: string) => {
    setStatus(val);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((val: string) => {
    setSort(val);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setStatus("");
    setSort("");
    setPage(1);
  }, []);

  const hasFilters = Boolean(search || status || sort);

  return (
    <div className="min-h-full w-full p-4 md:p-6 lg:p-8 flex flex-col gap-6 pb-20">
      <MembersHeader
        totalMembers={data?.pagination?.totalResults}
        onInviteClick={() => setIsInviteOpen(true)}
      />

      {/* Pending Invitations list for the coach */}
      <PendingInvitationsList />

      <MembersToolbar
        searchValue={search}
        onSearchChange={handleSearchChange}
        statusValue={status}
        onStatusChange={handleStatusChange}
        sortValue={sort}
        onSortChange={handleSortChange}
      />

      {isLoading ? (
        <MembersLoading />
      ) : isError ? (
        <MembersError
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
        />
      ) : data?.members && data.members.length > 0 ? (
        <>
          <MembersList members={data.members} />
          {data.pagination && (
            <MembersPagination
              page={data.pagination.page}
              limit={data.pagination.limit}
              totalPages={data.pagination.totalPages}
              totalResults={data.pagination.totalResults}
              onPageChange={setPage}
            />
          )}
        </>
      ) : (
        <MembersEmpty
          hasFilters={hasFilters}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Invite Member Dialog */}
      <InviteMemberDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </div>
  );
};

export default MembersManagementPage;
