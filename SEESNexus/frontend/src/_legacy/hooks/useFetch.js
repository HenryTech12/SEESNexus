import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const useFetch = (fetchFn, options = {}) => {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(!!fetchFn);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn(...args);
      setData(result);
      return result;
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong';
      setError(message);
      if (!options.silent) {
        toast.error(message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFn, options.silent]);

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [execute, options.immediate]);

  return { data, loading, error, execute, setData };
};

export default useFetch;
