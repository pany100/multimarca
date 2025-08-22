import { useFetch } from "@/contexts/FetchContext";

function useUsersAutocomplete() {
  const { authFetch } = useFetch();

  const searchUsers = async (query: string) => {
    const response = await authFetch(
      `/api/usuarios?query=${query}&limit=10&page=0`
    );
    const data = await response.json();
    return data.items.map((user: { fullName: any; id: any }) => ({
      label: user.fullName,
      value: user.id,
    }));
  };

  const initialUser = async (id: string) => {
    const response = await authFetch(`/api/usuarios/${id}`);
    const data = await response.json();
    return {
      label: data.fullName,
      value: id,
    };
  };

  return {
    searchUsers,
    initialUser,
  };
}

export default useUsersAutocomplete;
