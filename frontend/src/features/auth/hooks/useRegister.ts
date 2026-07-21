import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { register } from "../api/auth.api";

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: register,

    onSuccess: () => {
      toast.success("Account created successfully");

      navigate("/login");
    },

    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });
};
