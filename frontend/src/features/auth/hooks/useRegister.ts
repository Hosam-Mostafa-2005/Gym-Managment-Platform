// src/features/auth/hooks/useRegister.ts
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { register } from "../api/auth.api";

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: register,

    onSuccess: (response, variables) => {
      const isPending = response.data?.user?.isPendingRegistration;
      if (isPending) {
        toast.info(
          response.message ||
            "An unverified account with this email already exists. A fresh verification code was sent.",
        );
      } else {
        toast.success(
          response.message ||
            "Account created! Please enter the 6-digit verification code sent to your email.",
        );
      }
      navigate(`/verify-email?email=${encodeURIComponent(variables.email)}`, {
        state: { delivery: response.delivery },
      });
    },

    onError: (error: AxiosError<{ message: string }>) => {
      const msg = error.response?.data?.message || "Registration failed.";
      toast.error(msg);
    },
  });
};
