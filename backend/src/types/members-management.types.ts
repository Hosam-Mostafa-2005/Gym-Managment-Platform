export interface MemberManagementCard {
  member: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    joinedAt: Date;
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
    lastWorkout: Date | null;
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
