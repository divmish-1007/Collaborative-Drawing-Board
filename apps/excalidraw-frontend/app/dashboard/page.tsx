"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/signin");
    }else{
        setLoading(false)
    }
  }, [router]);

  if (loading) return <div>Checking auth...</div>;
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>You are logged in</p>
    </div>
  );
}