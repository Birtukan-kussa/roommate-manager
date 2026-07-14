import { Suspense } from "react";
import SignupForm from "@/componets/auth/SignupForm";

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading signup form...</div>}>
      <SignupForm />
    </Suspense>
  );
}