// hooks/useApi.js

import { useSession } from "next-auth/react";
import { api } from "@/lib/api-service";
import { useState } from "react";

export function useApi() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = async (apiMethod, ...args) => {
    if (!session) {
      setError("Not authenticated");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiMethod.apply(api, args);
      return result;
    } catch (err) {
      setError(err.message || "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    callApi,
    api,
  };
}
