export interface MemberManagementCard {
  member: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    joinedAt: string;
  };

  assignment: {
    status: string;
    currentWorkout: {
      id: string;
      title: string;
    } | null;
    trainer: {
      id: string;
      name: string;
    } | null;
  } | null;

  workout: {
    completionRate: number;
    lastWorkout: string | null;
  };

  measurements: {
    latestWeight: number | null;
  };
}

export interface MembersManagementResponse {
  members: MemberManagementCard[];

  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
}

export interface MembersManagementQuery {
  search?: string;
  status?: string;
  trainer?: string;
  workout?: string;
  sort?: string;
  page?: number;
  limit?: number;
}
