import { useQuery } from "@tanstack/react-query";
import { getPlanes } from "../services/planesService";

export function usePlanes() {
  return useQuery({
    queryKey: ["planes"],
    queryFn: getPlanes,
  });
}