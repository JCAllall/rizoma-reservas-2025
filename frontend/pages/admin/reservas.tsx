import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ReservasRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/admin");
  }, []);
  
  return null;
}