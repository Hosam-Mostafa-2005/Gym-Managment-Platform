export interface RawUser {
  name: string;
  email: string;
  password: string;
  role: "admin" | "trainer" | "member";
  phone?: string;
  isActive?: boolean;
}

const DEFAULT_PASSWORD = "12345678";

export const usersData: RawUser[] = [
  // Admin
  {
    name: "Admin User",
    email: "admin@gym.com",
    password: DEFAULT_PASSWORD,
    role: "admin",
    phone: "+201000000001",
    isActive: true,
  },
  // Trainers
  {
    name: "Omar Hassan",
    email: "omar@gym.com",
    password: DEFAULT_PASSWORD,
    role: "trainer",
    phone: "+201000000002",
    isActive: true,
  },
  {
    name: "Sara Ali",
    email: "sara@gym.com",
    password: DEFAULT_PASSWORD,
    role: "trainer",
    phone: "+201000000003",
    isActive: true,
  },
  {
    name: "Mahmoud Tarek",
    email: "mahmoud@gym.com",
    password: DEFAULT_PASSWORD,
    role: "trainer",
    phone: "+201000000004",
    isActive: true,
  },
  // 15 Members (Realistic Arabic Names)
  {
    name: "Ahmed Mansour",
    email: "member1@gym.com",
    password: DEFAULT_PASSWORD,
    role: "member",
    phone: "+201010000001",
  },
  {
    name: "Fatima Zahra",
    email: "member2@gym.com",
    password: DEFAULT_PASSWORD,
    role: "member",
    phone: "+201010000002",
  },
  {
    name: "Youssef Ibrahim",
    email: "member3@gym.com",
    password: DEFAULT_PASSWORD,
    role: "member",
    phone: "+201010000003",
  },
  {
    name: "Nour El-Din",
    email: "member4@gym.com",
    password: DEFAULT_PASSWORD,
    role: "member",
    phone: "+201010000004",
  },
  {
    name: "Mariam Sadek",
    email: "member5@gym.com",
    password: DEFAULT_PASSWORD,
    role: "member",
    phone: "+201010000005",
  },
  {
    name: "Khaled Abdel-Rahman",
    email: "member6@gym.com",
    password: DEFAULT_PASSWORD,
    role: "member",
    phone: "+201010000006",
  },
  {
    name: "Amina Magdy",
    email: "member7@gym.com",
    password: DEFAULT_PASSWORD,
    role: "member",
    phone: "+201010000007",
  },
  {
    name: "Mostafa Kamel",
    email: "member8@gym.com",
    password: DEFAULT_PASSWORD,
    role: "member",
    phone: "+201010000008",
  },
  {
    name: "Hana Sherif",
    email: "member9@gym.com",
    password: DEFAULT_PASSWORD,
    role: "member",
    phone: "+201010000009",
  },
  {
    name: "Karim Fathi",
    email: "member10@gym.com",
    password: DEFAULT_PASSWORD,
    role: "member",
    phone: "+201010000010",
  },
  {
    name: "Salma Yasser",
    email: "member11@gym.com",
    password: DEFAULT_PASSWORD,
    role: "member",
    phone: "+201010000011",
  },
  {
    name: "Tarek Adel",
    email: "member12@gym.com",
    password: DEFAULT_PASSWORD,
    role: "member",
    phone: "+201010000012",
  },
  {
    name: "Yasmine Wael",
    email: "member13@gym.com",
    password: DEFAULT_PASSWORD,
    role: "member",
    phone: "+201010000013",
  },
  {
    name: "Hassan Othman",
    email: "member14@gym.com",
    password: DEFAULT_PASSWORD,
    role: "member",
    phone: "+201010000014",
  },
  {
    name: "Dina Farouk",
    email: "member15@gym.com",
    password: DEFAULT_PASSWORD,
    role: "member",
    phone: "+201010000015",
  },
];
